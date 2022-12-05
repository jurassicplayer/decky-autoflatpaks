import { ServerAPI } from "decky-frontend-lib"
import { FlatpakMetadata, FlatpakUpdate, LocalFlatpakMetadata, RemoteFlatpakMetadata } from "./Flatpak"

export interface queueData {
  action: string
  packageRef: string
}

interface cliOutput {
  output?: any
  returncode?: number
  stdout?: string
  stderr?: string
}

export enum appStates {
  initializing,
  failedInitialize,
  idle,
  checkingForUpdates,
  processingQueue,
  updatingAllPackages
} 

export class Backend {
  private static serverAPI: ServerAPI
  private static packageList: FlatpakMetadata[]
  private static queue: queueData[]
  private static appState: {
    initialized : boolean
    state: number
  }
  public static eventBus: EventTarget

  //#region Backend class interactions
  static initBackend(server: ServerAPI) {
    // Basically a constructor/pseudo-context
    this.setServer(server)
    this.appState = {
      initialized: false,
      state: appStates.initializing 
    }
    this.eventBus = new EventTarget()
    this.packageList = []
    this.queue = []
  }
  static setServer(server: ServerAPI) { this.serverAPI = server }
  static getServer() { return this.serverAPI }
  static setAppState(state: appStates) {
    this.appState.state = state
    this.eventBus.dispatchEvent(new CustomEvent('AppStateChange', {detail: {state: this.appState.state}}))
  }
  static getAppState() { return this.appState.state }
  static getPL() { return this.packageList }
  static setPL(packageList: FlatpakMetadata[]) { // #REMOVE
    this.packageList = packageList
    this.eventBus.dispatchEvent(new CustomEvent('PackageListChange', {detail: {packageList: this.packageList}}))
  }
  static setPLPackage(pkgref: string, metadata: any) {
    console.log('Updating single package info in packagelist for: ', pkgref)
    var idx = this.packageList.findIndex(plitem => plitem.ref == pkgref)
    this.packageList[idx] = {...this.packageList[idx], ...metadata}
    this.eventBus.dispatchEvent(new CustomEvent(pkgref, {detail: {packageInfo: this.packageList[idx]}}))
  }
  static getQueue() { return this.queue }
  static setQueue(queue: queueData[]) { this.queue = queue } // Basically one use-case: clear the queue
  static setAppInitialized(state: boolean) {this.appState.initialized = state}
  static getAppInitialized() { return this.appState.initialized}

  static async bridge(functionName: string, namedArgs?: any) {
    namedArgs = (namedArgs) ? namedArgs : {}
    var output = await this.serverAPI.callPluginMethod(functionName, namedArgs)
    console.debug('[AutoFlatpaks] bridge - ', functionName,': ', output)
    return output.result as cliOutput
  }
  //#endregion

  //#region Settings interactions
  static async getSetting(key: string, defaults: any) {
    var proc = await this.bridge("settings_getSetting", {key, defaults})
    return proc.output
  }
  static async setSetting(key: string, value: any) {
    var proc = await this.bridge("settings_setSetting", {key, value})
    return proc.output
  }
  static async commitSettings() {
    var proc = await this.bridge("settings_commit")
    return proc.output
  }
  //#endregion

  //#region Queue interactions
  static async queueAction(queueData: queueData): Promise<boolean> {
    if (this.getAppState() != appStates.idle) return false
    this.queue.push(queueData)
    console.log("queueAction: ", this.queue)
    return true
  }
  static async dequeueAction(queueData: queueData, processQueue?: boolean): Promise<boolean> {
    if (this.getAppState() != appStates.idle && !processQueue) return false
    this.queue = this.queue.filter(item => !(item.action == queueData.action && item.packageRef == queueData.packageRef))
    console.log("dequeueAction: ", this.queue)
    return true
  }
  static async ProcessQueue(): Promise<any | undefined> {
    if (this.getAppState() != appStates.idle) return undefined
    this.setAppState(appStates.processingQueue)
    let queueLength = this.queue.length
    for (var item of this.queue) {
      console.log("Processing Queue Item: ", item)
      // Run await action: mask/unmask, install/uninstall, update
      if (item.action == 'mask')      { await this.MaskPackage(item.packageRef) }
      if (item.action == 'unmask')    { await this.UnMaskPackage(item.packageRef) }
      if (item.action == 'install')   { await this.InstallPackage(item.packageRef) }
      if (item.action == 'uninstall') { await this.UnInstallPackage(item.packageRef) }
      if (item.action == 'update')    { await this.UpdatePackage(item.packageRef) }
      await this.dequeueAction(item, true)
    }
    this.setAppState(appStates.idle)
    if (queueLength) this.eventBus.dispatchEvent(new CustomEvent('QueueCompletion', {detail: {queueLength: queueLength}}))
  }
  //#endregion

  //#region Flatpak getInfo interactions
  static async getPackageList(localOnly?: boolean): Promise<Array<FlatpakMetadata>> {
    console.log('Creating package list')
    var output: FlatpakMetadata[] = []
    await Promise.all([this.getRemotePackageList(), this.getRemotePackageList(true), this.getLocalPackageList(), this.getMaskList()]).then((value: [RemoteFlatpakMetadata[], RemoteFlatpakMetadata[], LocalFlatpakMetadata[], string[]]) => {
      var rpl = value[0] || []
      var upl = value[1] || []
      var lpl = value[2]
      var mpl = value[3]
      // Add local packages & updateable data to list
      output = lpl.map(lplitem => {
        var default_metadata = {
          installed: true,
          updateable: false,
          masked: false
        }
        
        var idx = upl.findIndex(uplitem => uplitem.ref == lplitem.ref)
        if (idx < 0) return {...lplitem, ...default_metadata}
        var uplitem = upl[idx]
        var upl_metadata = {
          commit:         uplitem.commit,
          download_size:  uplitem.download_size,
          updateable:     (uplitem.commit != lplitem.active) ? true : false
        }
        return {...lplitem, ...default_metadata, ...upl_metadata}
      })
      console.log('PL (LPL+U): ', output)

      // Add remote packages not in list
      if (!localOnly && rpl) {
        var rplitems = rpl.filter((rplitem) => !lpl.map((lplitem) => lplitem.ref).includes(rplitem.ref))
        for (let rplitem of rplitems) { output.push({ ...rplitem, installed: false, updateable: false, masked: false }) }
        console.log('PL (LPL+U+RPL): ', output)
      }
      
      // Add mask data to list
      output.map((item) => {
        if (mpl.includes(item.ref)) {item.masked = true}
        if (item.parent && mpl.includes(item.parent)) {item.parentMasked = true}
        return item
      })
      console.log('PL (LPL+U+RPL+MPL): ', output)
    })
    this.setPL(output)
    return output as Array<FlatpakMetadata>
  }
  static async getLocalPackageList(): Promise<Array<LocalFlatpakMetadata>> {
    var proc = await this.bridge("getLocalPackageList")
    return proc.output as Array<LocalFlatpakMetadata>
  }
  static async getRemotePackageList(updateOnly?: boolean): Promise<Array<RemoteFlatpakMetadata>> {
    var proc = await this.bridge("getRemotePackageList", {updateOnly: updateOnly})
    return proc.output as Array<RemoteFlatpakMetadata>
  }
  static async getMaskList(): Promise<Array<string>> {
    var proc = await this.bridge("getMaskList")
    return proc.output as Array<string>
  }
  static async getUpdatePackageList(): Promise<Array<FlatpakUpdate>> {
    this.setAppState(appStates.checkingForUpdates)
    var proc = await this.bridge("getUpdatePackageList")
    this.setAppState(appStates.idle)
    return proc.output as Array<FlatpakUpdate>
  }
  static async getPackageCount() {
    var packages = await this.getUpdatePackageList()
    if (!packages) return undefined
    var package_count = packages.length
    return package_count
  }
  //#endregion

  //#region Flatpak Action interactions
  static async MaskPackage(pkgref: string) {
    var proc = await this.bridge("MaskPackage", {pkgref: pkgref})
    if (proc.returncode != 0) return false
    this.setPLPackage(pkgref, {masked: true})
    // Update child package masked information
    this.packageList.filter(item => item.parent == pkgref).forEach(item => this.setPLPackage(item.ref, {parentMasked: true}))
    return true
  }
  static async UnMaskPackage(pkgref: string) {
    var proc = await this.bridge("UnMaskPackage", {pkgref: pkgref})
    if (proc.returncode != 0) return false
    this.setPLPackage(pkgref, {masked: false})
    // Update child package masked information
    this.packageList.filter(item => item.parent == pkgref).forEach(item => this.setPLPackage(item.ref, {parentMasked: false}))
    return true
  }
  static async InstallPackage(pkgref: string) {
    var proc = await this.bridge("InstallPackage", {pkgref: pkgref})
    if (proc.returncode != 0) return false
    this.setPLPackage(pkgref, {installed: true})
    return true
  }
  static async UnInstallPackage(pkgref: string) {
    var proc = await this.bridge("UnInstallPackage", {pkgref: pkgref})
    if (proc.returncode != 0) return false
    this.setPLPackage(pkgref, {installed: false})
    return true
  }
  static async UpdatePackage(pkgref: string) {
    var proc = await this.bridge("UpdatePackage", {pkgref: pkgref})
    if (proc.returncode != 0) return false
    this.setPLPackage(pkgref, {updateable: false})
    return true
  }
  static async UpdateAllPackages() {
    if (this.getAppState() != appStates.idle) return false
    var returncode = true
    var upl: FlatpakUpdate[] = []
    var lpl: LocalFlatpakMetadata[] = []
    await Promise.all([this.getUpdatePackageList(), this.getLocalPackageList()]).then((value: [FlatpakUpdate[], LocalFlatpakMetadata[]]) => {
      upl = value[0]
      lpl = value[1]
    })
    this.setAppState(appStates.updatingAllPackages)
    for (let uplitem of upl) {
      var idx = lpl.findIndex(lplitem => lplitem.application == uplitem.application && lplitem.branch == uplitem.branch && lplitem.origin == uplitem.remote)
      var proc = await this.UpdatePackage(lpl[idx].ref)
      if (!proc) returncode = false // return failure if at least one package command fails
    }
    this.setAppState(appStates.idle)
    return returncode
  }
  //#endregion

  static async long_process() {
    if (this.getAppState() != appStates.idle) return undefined
    this.setAppState(appStates.checkingForUpdates)
    setTimeout(()=>{this.setAppState(appStates.idle)}, 60000)
    return 1
  }
}

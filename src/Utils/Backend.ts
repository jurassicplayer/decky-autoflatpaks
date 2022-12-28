import { ServerAPI } from "decky-frontend-lib"
import { FlatpakMetadata, FlatpakUnused, FlatpakUpdate, LocalFlatpakMetadata, RemoteFlatpakMetadata } from "./Flatpak"
import { JournalEntry } from "./History"
import { queueData, BatteryState, cliOutput } from "./Backend.d"
import { events } from "./Events"

export enum appStates {
  initializing,
  failedInitialize,
  idle,
  checkingForUpdates,
  buildingPackageList,
  processingQueue
} 

export class Backend {
  private static serverAPI: ServerAPI
  private static packageList: FlatpakMetadata[]
  private static queue: queueData[]
  private static queueLength: number
  private static queueProgress: number
  private static appState: {
    initialized : boolean
    state: number
  }
  private static pseudoBatteryState: BatteryState
  private static intervalID: NodeJS.Timer
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
    this.queueLength = 0
    this.queueProgress = 0
    
    this.intervalID = setInterval(()=>{
      // @ts-ignore
      let currentState = window.SystemPowerStore.batteryState
      if (currentState != this.pseudoBatteryState) this.setBatteryStateChange(currentState)
    }, 1000)
  }
  static onDismount() {
    clearInterval(this.intervalID)
  }
  static setBatteryStateChange(batteryState: BatteryState) {
    this.pseudoBatteryState = batteryState
    this.eventBus.dispatchEvent(new events.BatteryStateEvent(this.pseudoBatteryState))
  }
  static setServer(server: ServerAPI) { this.serverAPI = server }
  static getServer() { return this.serverAPI }
  static setAppState(state: appStates) {
    this.appState.state = state
    this.eventBus.dispatchEvent(new events.AppStateEvent(this.appState.state))
  }
  static getAppState() { return this.appState.state }
  static getPL() { return this.packageList }
  static setPL(packageList: FlatpakMetadata[]) {
    this.packageList = packageList
    this.eventBus.dispatchEvent(new events.PackageListEvent(this.packageList))
  }
  static setPLPackage(pkgref: string, metadata: any) {
    console.log('Updating single package info in packagelist for: ', pkgref)
    let idx = this.packageList.findIndex(plitem => plitem.ref == pkgref)
    this.packageList[idx] = {...this.packageList[idx], ...metadata}
    this.eventBus.dispatchEvent(new events.PackageInfoEvent(this.packageList[idx]))
  }
  static getQueue() { return this.queue }
  static setQueue(queue: queueData[]) { this.queue = queue }
  static getQueueLength() { return this.queueLength }
  static setQueueLength() { this.queueLength = Backend.getQueue().length}
  static getQueueProgress() { return (this.queueLength - this.queueProgress + 1) } // Offset by one to show current number instead of previous
  static setQueueProgress(currentQueueLength: number) { this.queueProgress = currentQueueLength }
  static setAppInitialized(state: boolean) {this.appState.initialized = state}
  static getAppInitialized() { return this.appState.initialized}

  static async bridge(functionName: string, namedArgs?: any) {
    namedArgs = (namedArgs) ? namedArgs : {}
    let output = await this.serverAPI.callPluginMethod(functionName, namedArgs)
    console.debug('[AutoFlatpaks] bridge - ', functionName,': ', output)
    return output.result as cliOutput
  }
  //#endregion

  //#region Settings interactions
  static async getSetting(key: string, defaults: any) {
    let proc = await this.bridge("settings_getSetting", {key, defaults})
    return proc.output
  }
  static async setSetting(key: string, value: any) {
    let proc = await this.bridge("settings_setSetting", {key, value})
    return proc.output
  }
  static async commitSettings() {
    let proc = await this.bridge("settings_commit")
    return proc.output
  }
  //#endregion

  //#region Queue interactions
  static async queueAction(queueData: queueData): Promise<boolean> {
    if (this.getAppState() != appStates.idle) return false
    this.queue.push(queueData)
    console.log("queueAction: ", queueData, this.queue)
    return true
  }
  static async dequeueAction(queueData: queueData, processQueue?: boolean): Promise<boolean> {
    if (this.getAppState() != appStates.idle && !processQueue) return false
    this.queue = this.queue.filter(item => !(item.action == queueData.action && item.packageRef == queueData.packageRef))
    console.log("dequeueAction: ", queueData, this.queue)
    return true
  }
  static async ProcessQueue(): Promise<boolean> {
    if (this.getAppState() != appStates.idle) return false
    this.setAppState(appStates.processingQueue)
    let returncode = true
    this.setQueueLength()
    let queueCopy = this.getQueue()
    let queueLength = this.getQueueLength()
    let queueRetCode = []
    for (let item of this.queue) {
      console.log("Processing Queue Item: ", item)
      let retcode = true
      this.setQueueProgress(this.queue.length)
      this.eventBus.dispatchEvent(new events.QueueProgressEvent(item, queueLength, this.getQueueProgress()))
      // Run await action: mask/unmask, install/uninstall, update
      if (item.action == 'mask')      { retcode = await this.MaskPackage(item.packageRef) }
      if (item.action == 'unmask')    { retcode = await this.UnMaskPackage(item.packageRef) }
      if (item.action == 'install')   { retcode = await this.InstallPackage(item.packageRef) }
      if (item.action == 'uninstall' && item.extraParameters?.removeUnused) { retcode = await this.UnInstallPackage(item.packageRef, item.extraParameters.removeUnused) }
      else if (item.action == 'uninstall') { retcode = await this.UnInstallPackage(item.packageRef) }
      if (item.action == 'update')    { retcode = await this.UpdatePackage(item.packageRef) }
      if (!retcode) returncode = false
      queueRetCode.push({queueData: item, retcode: retcode})
      await this.dequeueAction(item, true)
    }
    if (queueLength) this.eventBus.dispatchEvent(new events.QueueCompletionEvent(queueCopy, queueLength, queueRetCode))
    this.setAppState(appStates.idle)
    return returncode
  }
  //#endregion

  //#region Flatpak getInfo interactions
  static async getPackageList(localOnly?: boolean): Promise<FlatpakMetadata[] | undefined> {
    if (this.getAppState() == appStates.buildingPackageList) return undefined
    this.setAppState(appStates.buildingPackageList)
    let output: FlatpakMetadata[] = []
    await Promise.all([this.getRemotePackageList(), this.getRemotePackageList(true), this.getLocalPackageList(), this.getMaskList()]).then((value: [RemoteFlatpakMetadata[], RemoteFlatpakMetadata[], LocalFlatpakMetadata[], string[]]) => {
      let rpl = value[0] || []
      let upl = value[1] || []
      let lpl = value[2]
      let mpl = value[3]
      // Add local packages & updateable data to list
      output = lpl.map(lplitem => {
        let default_metadata = {
          installed: true,
          updateable: false,
          masked: false
        }
        
        let idx = upl.findIndex(uplitem => uplitem.ref == lplitem.ref)
        if (idx < 0) return {...lplitem, ...default_metadata}
        let uplitem = upl[idx]
        let upl_metadata = {
          commit:         uplitem.commit,
          download_size:  uplitem.download_size,
          updateable:     (uplitem.commit != lplitem.active) ? true : false
        }
        return {...lplitem, ...default_metadata, ...upl_metadata}
      })
      console.log('PL (LPL+U): ', output)

      // Add remote packages not in list
      if (!localOnly && rpl) {
        let rplitems = rpl.filter((rplitem) => !lpl.map((lplitem) => lplitem.ref).includes(rplitem.ref))
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
    this.setAppState(appStates.idle)
    return output as FlatpakMetadata[]
  }
  static async getLocalPackageList(): Promise<LocalFlatpakMetadata[]> {
    let proc = await this.bridge("getLocalPackageList")
    return proc.output as LocalFlatpakMetadata[]
  }
  static async getRemotePackageList(updateOnly?: boolean): Promise<RemoteFlatpakMetadata[]> {
    let proc = await this.bridge("getRemotePackageList", {updateOnly: updateOnly})
    return proc.output as RemoteFlatpakMetadata[]
  }
  static async getMaskList(): Promise<string[]> {
    let proc = await this.bridge("getMaskList")
    return proc.output as string[]
  }
  static async getUnusedPackageList(): Promise<FlatpakUnused[]> {
    let proc = await this.bridge("getUnusedPackageList")
    return proc.output as FlatpakUnused[]
  }
  static async getUpdatePackageList(): Promise<FlatpakUpdate[]> {
    this.setAppState(appStates.checkingForUpdates)
    let proc = await this.bridge("getUpdatePackageList")
    this.setAppState(appStates.idle)
    return proc.output as FlatpakUpdate[]
  }
  static async getPackageCount() {
    let packages = await this.getUpdatePackageList()
    if (!packages) return undefined
    let package_count = packages.length
    return package_count
  }
  static async getPackageHistory(): Promise<JournalEntry[]> {
    let proc = await this.bridge("getPackageHistory")
    return proc.output as JournalEntry[]
  }
  //#endregion

  //#region Flatpak Action interactions
  static async MaskPackage(pkgref: string) {
    let proc = await this.bridge("MaskPackage", {pkgref: pkgref})
    if (proc.returncode != 0) return false
    this.setPLPackage(pkgref, {masked: true})
    // Update child package masked information
    this.packageList.filter(item => item.parent == pkgref).forEach(item => this.setPLPackage(item.ref, {parentMasked: true}))
    return true
  }
  static async UnMaskPackage(pkgref: string) {
    let proc = await this.bridge("UnMaskPackage", {pkgref: pkgref})
    if (proc.returncode != 0) return false
    this.setPLPackage(pkgref, {masked: false})
    // Update child package masked information
    this.packageList.filter(item => item.parent == pkgref).forEach(item => this.setPLPackage(item.ref, {parentMasked: false}))
    return true
  }
  static async InstallPackage(pkgref: string) {
    let proc = await this.bridge("InstallPackage", {pkgref: pkgref})
    if (proc.returncode != 0) return false
    this.setPLPackage(pkgref, {installed: true})
    return true
  }
  static async UnInstallPackage(pkgref: string, removeUnused: boolean = false) {
    let proc = await this.bridge("UnInstallPackage", {pkgref: pkgref, removeUnused: removeUnused})
    if (proc.returncode != 0) return false
    this.setPLPackage(pkgref, {installed: false})
    return true
  }
  static async UpdatePackage(pkgref: string) {
    let proc = await this.bridge("UpdatePackage", {pkgref: pkgref})
    if (proc.returncode != 0) return false
    this.setPLPackage(pkgref, {updateable: false})
    return true
  }
  static async UpdateAllPackages() {
    if (this.getAppState() != appStates.idle) return false
    let returncode = await this.UpdateOrUnusedPackages(this.getUpdatePackageList())
    return returncode
  }
  //#endregion

  //#region Advanced Functions
  static async RemoveUnusedPackages() {
    if (this.getAppState() != appStates.idle) return false
    let returncode = await this.UpdateOrUnusedPackages(this.getUnusedPackageList())
    return returncode
  }
  static async UpdateOrUnusedPackages(promise: Promise<FlatpakUpdate[] | FlatpakUnused[]>) {
    let returncode = true
    let upl: FlatpakUpdate[] | FlatpakUnused[] = await promise
    if (!upl.length) return returncode
    if (!this.packageList.length) await this.getPackageList()
    let rpl: FlatpakMetadata[] = this.packageList
    let liveFPMQueue = [...this.queue]
    if (liveFPMQueue) this.setQueue([])
    for (let uplitem of upl) {
      let idx = rpl.findIndex(rplitem => rplitem.application == uplitem.application && rplitem.branch == uplitem.branch && (('remote' in uplitem && rplitem.origin == uplitem.remote) || !('remote' in uplitem)))
      let pkgAction = ''
      let extraParameters = {}
      if (['i', 'u'].includes(uplitem.op)) { pkgAction = 'update'}
      if (uplitem.op == 'r') {
        pkgAction = 'uninstall'
        extraParameters['removeUnused'] = true
      }
      if (!pkgAction) {
        console.log(`[${rpl[idx].ref}] Unknown op: ${uplitem.op}`)
        continue
      }
      this.queueAction({action: pkgAction, packageRef: rpl[idx].ref, extraParameters: extraParameters})
    }
    returncode = await this.ProcessQueue()
    if (liveFPMQueue) this.setQueue(liveFPMQueue)
    return returncode
  }
  //#endregion
}

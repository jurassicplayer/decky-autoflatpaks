import { ServerAPI } from "decky-frontend-lib"
import { FlatpakUpdate, LocalFlatpakMetadata, RemoteFlatpakMetadata } from "./Flatpak"

interface queueData {
  action: string
  packageRef: string
  setter: any
}

export class Backend {
  private static serverAPI: ServerAPI
  private static queue: queueData[]
  private static OnAppStateRegistry: Set<Function>
  public static appState: {
    initialized : boolean
    state: string
  }

  //#region Backend class interactions
  static initBackend(server: ServerAPI) {
    // Basically a constructor/pseudo-context
    this.setServer(server)
    this.appState = {
      initialized: false,
      state: "Idle"  
    }
    this.queue = []
    this.OnAppStateRegistry = new Set()
  }
  static setServer(server: ServerAPI) { this.serverAPI = server }
  static getServer() { return this.serverAPI }
  static setAppState(state: string) {
    this.appState.state = state
    this.OnAppStateRegistry.forEach((callback)=>callback(this.appState.state))
  }
  static getAppState() { return this.appState.state }
  static setAppInitialized(state: boolean) {this.appState.initialized = state}
  static getAppInitialized() { return this.appState.initialized}
  static RegisterForOnAppState(callback: Function) {
    this.OnAppStateRegistry.add(callback)
    const unregister = () => this.OnAppStateRegistry.delete(callback)
    return unregister
  }

  static async bridge(functionName: string, namedArgs?: any) {
    namedArgs = (namedArgs) ? namedArgs : {}
    var output = await this.serverAPI.callPluginMethod(functionName, namedArgs)
    return output.result
  }
  //#endregion

  //#region Settings interactions
  static async getSetting(key: string, defaults: any) {
    var output = await this.bridge("settings_getSetting", {key, defaults})
    return output
  }
  static async setSetting(key: string, value: any) {
    var output = await this.bridge("settings_setSetting", {key, value})
    return output
  }
  static async commitSettings() {
    var output = await this.bridge("settings_commit")
    return output
  }
  //#endregion

  //#region Queue interactions
  static async queueAction(queueData: queueData): Promise<boolean> {
    if (this.getAppState() != "Idle") return false
    this.queue.push(queueData)
    console.log("queueAction: ", this.queue)
    return true
  }
  static async dequeueAction(queueData: queueData, processQueue?: boolean): Promise<boolean> {
    if (this.getAppState() != "Idle" && !processQueue) return false
    this.queue = this.queue.filter(item => !(item.action == queueData.action && item.packageRef == queueData.packageRef))
    console.log("dequeueAction: ", this.queue)
    return true
  }
  static async ProcessQueue(): Promise<any | undefined> {
    if (this.getAppState() != "Idle") return undefined
    this.setAppState("ProcessingQueue")
    for (var item of this.queue) {
      console.log("Processing Queue Item: ", item)
      // Run await action: mask/unmask, install/uninstall, update
      if (item.action == 'mask')      { await this.MaskPackage(item.packageRef) }
      if (item.action == 'unmask')    { await this.UnMaskPackage(item.packageRef) }
      if (item.action == 'install')   { await this.InstallPackage(item.packageRef) }
      if (item.action == 'uninstall') { await this.UnInstallPackage(item.packageRef) }
      if (item.action == 'update')    { await this.UpdatePackage(item.packageRef) }
      // Run setter to update flatpak card UI elements
      item.setter()
      await this.dequeueAction(item, true)
    }
    this.setAppState("Idle")
  }
  //#endregion

  //#region Flatpak getInfo interactions
  static async getLocalPackageList(): Promise<Array<LocalFlatpakMetadata>> {
    var output = await this.bridge("getLocalPackageList")
    return output as Array<LocalFlatpakMetadata>
  }
  static async getRemotePackageList(): Promise<Array<RemoteFlatpakMetadata>> {
    var output = await this.bridge("getRemotePackageList")
    return output as Array<RemoteFlatpakMetadata>
  }
  static async getMaskList(): Promise<Array<string>> {
    var output = await this.bridge("getMaskList")
    return output as Array<string>
  }
  static async getUpdates(): Promise<Array<FlatpakUpdate>> {
    this.setAppState("CheckForUpdates")
    var output = await this.bridge("getUpdates")
    this.setAppState("Idle")
    return output as Array<FlatpakUpdate>
  }
  static async getPackageCount() {
    var packages = await this.getUpdates()
    if (!packages) return undefined
    var package_count = packages.length
    return package_count
  }
  //#endregion

  //#region Flatpak Action interactions
  static async MaskPackage(pkgref: string) {
    var output = await this.bridge("MaskPackage", {pkgref: pkgref})
    return output
  }
  static async UnMaskPackage(pkgref: string) {
    var output = await this.bridge("UnMaskPackage", {pkgref: pkgref})
    return output
  }
  static async InstallPackage(pkgref: string) {
    var output = await this.bridge("InstallPackage", {pkgref: pkgref})
    return output
  }
  static async UnInstallPackage(pkgref: string) {
    var output = await this.bridge("UnInstallPackage", {pkgref: pkgref})
    return output
  }
  static async UpdatePackage(pkgref: string) {
    var output = await this.bridge("UpdatePackage", {pkgref: pkgref})
    return output
  }
  static async UpdateAllPackages() {
    if (this.getAppState() != "Idle") return undefined
    this.setAppState("UpdatingFlatpaks")
    var output = await this.bridge("UpdateAllPackages")
    this.setAppState("Idle")
    return output
  }
  //#endregion

  static async long_process() {
    if (this.getAppState() != "Idle") return undefined
    this.setAppState("CheckForUpdates")
    setTimeout(()=>{this.setAppState("Idle")}, 10000)
    return 1
  }
}

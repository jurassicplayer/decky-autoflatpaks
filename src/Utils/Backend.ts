import { ServerAPI } from "decky-frontend-lib"
import { FlatpakUpdate, LocalFlatpakMetadata, RemoteFlatpakMetadata } from "./Flatpak"

export class Backend {
  private static serverAPI: ServerAPI
  private static appState: {
    initialized : boolean
    state: string
  }

  static initBackend(server: ServerAPI) {
    this.setServer(server)
    this.appState = {
      initialized: false,
      state: "Idle"  
    }
  }
  static setServer(server: ServerAPI) { this.serverAPI = server }
  static getServer() { return this.serverAPI }
  static setAppState(state: string) { this.appState.state = state }
  static getAppState() { return this.appState.state }
  static setAppInitialized(state: boolean) {this.appState.initialized = state}
  static getAppInitialized() { return this.appState.initialized}

  static async bridge(functionName: string, namedArgs?: any) {
    namedArgs = (namedArgs) ? namedArgs : {}
    var output = await this.serverAPI.callPluginMethod(functionName, namedArgs)
    return output.result
  }

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

  static async CheckForUpdates(): Promise<Array<FlatpakUpdate> | undefined > {
    if (this.getAppState() != "Idle") return undefined
    this.setAppState("CheckForUpdates")
    var output = await this.bridge("CheckForUpdates")
    this.setAppState("Idle")
    return output as Array<FlatpakUpdate>
  }
  static async getMaskList(): Promise<Array<string> | undefined> {
    var output = await this.bridge("getMaskList")
    return output as Array<string>
  }
  static async UpdateAllPackages() {
    if (this.getAppState() != "Idle") return undefined
    this.setAppState("UpdatingFlatpaks")
    var output = await this.bridge("UpdateAllPackages")
    this.setAppState("Idle")
    return output
  }
  static async getLocalPackageList(): Promise<Array<LocalFlatpakMetadata> | undefined > {
    var output = await this.bridge("LocalPackageList")
    return output as Array<LocalFlatpakMetadata>
  }
  static async getRemotePackageList(): Promise<Array<RemoteFlatpakMetadata> | undefined > {
    var output = await this.bridge("pullRemotePackageList")
    return output as Array<RemoteFlatpakMetadata>
  }
  static async getPackageCount() {
    var packages = await this.CheckForUpdates()
    if (!packages) return undefined
    var package_count = packages.length
    return package_count
  }

  static async long_process() {
    if (this.getAppState() != "Idle") return undefined
    this.setAppState("CheckForUpdates")
    setTimeout(()=>{this.setAppState("Idle")}, 10000)
    return 1
  }
}

import { ServerAPI, findModuleChild, Module } from "decky-frontend-lib";
import { Settings } from "./settings";

const findModule = (property: string) => {
  return findModuleChild((m: Module) => {
    if (typeof m !== "object") return undefined;
    for (let prop in m)
      try {
        if (m[prop][property])
          return m[prop];
      } catch (e) {
        console.log(`Unable to findModuleChild for '${property}'`)
        return undefined;
      }
  });
}

const AudioParent = findModule("GamepadUIAudio");
const NavSoundMap = findModule("ToastMisc");

export class Backend {
  private serverAPI: ServerAPI;
  private settings: Settings;

  constructor(serverAPI: ServerAPI, settings: Settings) {
    this.serverAPI = serverAPI;
    this.settings = settings
  }

  async pyexec_subprocess(cmd: string) {
    var output = await this.serverAPI.callPluginMethod("pyexec_subprocess", {cmd})
    console.log(output.result)
  }

  async getPackageCount() {
    var packages = await this.checkForUpdates();
    var package_count = Object.keys(packages).length
    return package_count
  }

  async checkForUpdates() {
    var output = await this.serverAPI.callPluginMethod("checkForUpdates", {})
    return output.result
  }
  async updateAllPackages(resolve?: boolean) {
    var output = await this.serverAPI.callPluginMethod("updateAllPackages", {})
    if (resolve) this.notify('AutoFlatpaks', 'Updated all packages')
    return output.result
  }
  async notify(title: string, msg: string, notificationEnabled?: boolean, soundEnabled?: boolean, toast_ms?: number) {
    let notification = this.settings.notificationEnabled
    let sound = this.settings.soundEnabled
    let duration = 8000
    if (notificationEnabled) notification = notificationEnabled
    if (soundEnabled) sound = soundEnabled
    if (toast_ms) duration = toast_ms
    if(notification){
      this.toast(title, msg, duration);
    } else if(sound){
      AudioParent.GamepadUIAudio.PlayNavSound(NavSoundMap.ToastMisc)
    }
  }
  async toast(title: string, message: string, duration: number) {
    return (() => {
      try {
        return this.serverAPI.toaster.toast({
          title: title,
          body: message,
          duration: duration
        });
      } catch (e) {
        console.log("Toaster Error: "+e);
      }
    })();
  }
}

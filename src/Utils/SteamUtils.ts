import { findModuleChild, Module } from "decky-frontend-lib"
import { Backend } from "./Backend";
import { Settings } from "./Settings";

//#region Find SteamOS modules
const findModule = (property: string) => {
  return findModuleChild((m: Module) => {
    if (typeof m !== "object") return undefined;
    for (let prop in m) {
      try {
        if (m[prop][property])
          return m[prop]
      } catch {
        return undefined
      }
    }
  })
}
const NavSoundMap = findModule("ToastMisc");
//#endregion

export class SteamUtils {
  //#region Notification Wrapper
  static async notify(title: string, message: string, showToast?: boolean, playSound?: boolean, sound?: number, duration?: number) {
    if (sound === undefined ) sound = NavSoundMap?.ToastMisc // Not important, could pass the actual number instead (6)
    if (playSound === undefined ) playSound = Settings.playSound
    if (showToast === undefined ) showToast = Settings.showToast
    let toastData = {
      title: title,
      body: message,
      duration: duration,
      sound: sound,
      playSound: playSound,
      showToast: showToast
    }
    Backend.getServer().toaster.toast(toastData)
  }
}
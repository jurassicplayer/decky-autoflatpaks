import { ToastData, findModuleChild, Module } from "decky-frontend-lib"
import { Settings } from "./Settings"

//#region Find SteamOS modules
const findModule = (property: string) => {
  return findModuleChild((m: Module) => {
    if (typeof m !== "object") return undefined;
    for (let prop in m)
      try {
        if (m[prop][property])
          return m[prop];
      } catch (e) {
        // console.log(`Unable to findModuleChild for '${property}'`)
        return undefined;
      }
  });
}

const AudioParent = findModule("GamepadUIAudio");
const NavSoundMap = findModule("ToastMisc");
const NotificationStore = findModule("BIsUserInGame")
//#endregion

interface ToastDataExtended extends ToastData {
  etype?: number
  sound?: number
  showToast?: boolean
}

export class SteamUtils {
  //#region Notification Wrapper
  // Configurable notification wrapper
  static async notify(title: string, message: string, notificationEnabled?: boolean, soundEnabled?: boolean, duration?: number) {
    duration            = (duration) ? duration : 5e3
    notificationEnabled = (notificationEnabled) ? notificationEnabled : Settings.notificationEnabled
    soundEnabled        = (soundEnabled) ? soundEnabled : Settings.soundEnabled
    let soundfx = NavSoundMap?.ToastMisc // Not important, could pass the actual number instead
    let toastData: ToastDataExtended = {
      title: title,
      body: message,
      duration: duration,
      etype: 12,
      sound: (soundEnabled) ? soundfx : undefined,
      showToast: notificationEnabled
    }
    this.toast(toastData)
  }
  //#endregion


  //#region Toast Re-reimplementation
  // Until decky-frontend-lib has customizable notification sfx, try to keep it mostly drop-in replaceable 
  static async toast(toast: ToastDataExtended) {
    let toastData = {
      nNotificationID: NotificationStore.m_nNextTestNotificationID++,
      rtCreated: Date.now(),
      eType: toast.etype || (toast.etype = 15),
      nToastDurationMS: toast.duration || (toast.duration = 5e3),
      data: toast,
      decky: true,
    }
    // @ts-ignore
    toastData.data.appid = ()=>0
    // Check for system notification settings
    // @ts-ignore
    if ((settingsStore.settings.bDisableAllToasts && !toast.critical) || (settingsStore.settings.bDisableToastsInGame && !toast.critical && NotificationStore.BIsUserInGame())) {
      console.log("[AutoFlatpaks] Disable/hide non-critical turned on, skipping notification")
      return
    }
    if(toast.sound) AudioParent.GamepadUIAudio.PlayNavSound(toast.sound)
    if(toast.showToast) {
      NotificationStore.m_rgNotificationToasts.push(toastData)
      NotificationStore.DispatchNextToast()
    }
  }
  //#endregion
}
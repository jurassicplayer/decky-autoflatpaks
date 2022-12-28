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


//#region Deprecate when notification changes hit stable
import { ToastData } from "decky-frontend-lib"
const audioModule = findModuleChild((m: Module) => {
  if (typeof m !== "object") return undefined;
  for (let prop in m) {
    try {
      if (m[prop].PlayNavSound && m[prop].RegisterCallbackOnPlaySound)
        return m[prop]
    } catch {
      return undefined
    }
  }
})
const settingsStore = findModuleChild((m: Module) => {
  if (typeof m !== "object") return undefined;
  for (let prop in m) {
    try {
      if (m[prop].m_Settings && m[prop].m_FriendSettings && m[prop].m_BatteryPreferences && m[prop].m_StorePreferences)
        return m[prop]
    } catch {
      return undefined
    }
  }
})
interface ToastDataExtended extends ToastData {
  etype?: number
  sound?: number
  showToast?: boolean
  playSound?: boolean
}
const NotificationStore = findModule("BIsUserInGame")
//#endregion

export class SteamUtils {
  //#region Deprecate when notification changes hit stable
  static async notify(title: string, message: string, showToast?: boolean, playSound?: boolean, sound?: number, duration?: number) {
    //@ts-ignore
    let versionInfo: string = DeckyPluginLoader?.deckyState?._versionInfo?.current
    if (!versionInfo) {
      this.notifyOld(title, message, showToast, playSound, duration)
      throw new Error('Unable to get decky-loader version')
    }
    let vInfo = versionInfo.split('v')[1].split('-')[0].split('.').map(number => Number(number))
    if (vInfo[0] <= 2 && vInfo[1] <= 4 && vInfo[3] < 5) {
      this.notifyOld(title, message, showToast, playSound, duration)
    } else {
      this.notifyPlus(title, message, showToast, playSound, sound, duration)
    }
  }
  //#endregion

  //#region Notification Wrapper
  static async notifyPlus(title: string, message: string, showToast?: boolean, playSound?: boolean, sound?: number, duration?: number) {
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

  //#region Deprecate when notification changes hit stable
  static async notifyOld(title: string, message: string, showToast?: boolean, playSound?: boolean, duration?: number) {
    let soundfx = NavSoundMap?.ToastMisc // Not important, could pass the actual number instead (6)
    if (playSound === undefined ) playSound = Settings.playSound
    if (showToast === undefined ) showToast = Settings.showToast
    let toastData: ToastDataExtended = {
      title: title,
      body: message,
      duration: duration,
      etype: 11,
      sound: soundfx,
      playSound: playSound,
      showToast: showToast
    }
    this.toast(toastData)
  }
  // Until decky-frontend-lib has customizable notification sfx, try to keep it mostly drop-in replaceable 
  static async toast(toast: ToastDataExtended) {
    let toastData = {
      nNotificationID: NotificationStore.m_nNextTestNotificationID++,
      rtCreated: Date.now(),
      eType: toast.etype || 11,
      nToastDurationMS: toast.duration || (toast.duration = 5e3),
      data: toast,
      decky: true,
    }
    // @ts-ignore
    toastData.data.appid = ()=> 0
    if (toast.sound === undefined) toast.sound = 6
    if (toast.playSound === undefined) toast.playSound = true
    if (toast.showToast === undefined) toast.showToast = true
    // Check for system notification settings
    if ((settingsStore.settings.bDisableAllToasts && !toast.critical) || (settingsStore.settings.bDisableToastsInGame && !toast.critical && NotificationStore.BIsUserInGame())) {
      console.debug("[AutoFlatpaks] Disable/hide non-critical turned on, skipping notification")
      return
    }
    if(toast.playSound) audioModule.PlayNavSound(toast.sound)
    if(toast.showToast) {
      NotificationStore.m_rgNotificationToasts.push(toastData)
      NotificationStore.DispatchNextToast()
    }
  }
  //#endregion
}
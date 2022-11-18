import {
  definePlugin,
  ServerAPI,
  staticClasses
} from "decky-frontend-lib";
import { FaBox } from "react-icons/fa"
import { FlatpakManager } from "./FlatpakManager/FlatpakManager"
import { QAMPanel } from "./QAM/QAMPanel"
import { Settings } from "./Utils/Settings"
import { Backend } from "./Utils/Backend"
import { SteamUtils } from "./Utils/SteamUtils"

const initPlugin = async () => {
  await Settings.loadFromLocalStorage()
  checkOnBoot()
  registerLoop()
  Backend.setAppInitialized(true)
}

const checkOnBoot = () => {
  // Apply check on boot setting
  if (Settings.checkOnBootEnabled) {
    var date = new Date()
    date.setMinutes(date.getMinutes() - Settings.updateInterval)
    Settings.lastCheckTimestamp = date
  }
}

const registerLoop = () => {
  // interval check loop
  SteamClient.System.RegisterForBatteryStateChanges(async ()=> {
    var currentTime = new Date()
    if (!((currentTime.getTime() - Settings.lastCheckTimestamp.getTime())/1000/60 > Settings.updateInterval)) return
    // Time to check for updates
    Settings.lastCheckTimestamp = currentTime
    var package_count = await Backend.getPackageCount()
    if (!package_count) return
    var notificationText = `${package_count} updates available`
    if (Settings.unattendedUpgradesEnabled) {
      notificationText = `Updating ${package_count} packages...`
      Backend.UpdateAllPackages()
    }
    SteamUtils.notify('AutoFlatpaks', notificationText)
  })
}

export default definePlugin((serverApi: ServerAPI) => {
  Backend.initBackend(serverApi)
  serverApi.routerHook.addRoute("/flatpak-manager", FlatpakManager)

  initPlugin()

  return {
    title: <div className={staticClasses.Title}>AutoFlatpaks</div>,
    content: <QAMPanel />,
    icon: <FaBox />,
    onDismount: () => {
      serverApi.routerHook.removeRoute('/flatpak-manager');
    }
  };
});

import {
  definePlugin,
  ServerAPI,
  staticClasses
} from "decky-frontend-lib";
import { FaBox } from "react-icons/fa"
import { FlatpakManager } from "./FlatpakManager/FlatpakManager"
import { QAMPanel } from "./QAM/QAMPanel"
import { Settings } from "./Utils/Settings"
import { appStates, Backend } from "./Utils/Backend"
import { SteamUtils } from "./Utils/SteamUtils"

const initPlugin = async () => {
  var settings = await Settings.loadFromLocalStorage()
  if (!settings) {
    SteamUtils.notify('AutoFlatpaks', 'Failed to load setting, skipping check for sanity')
    Backend.setAppState(appStates.failedInitialize)
    return
  }
  checkOnBoot()
  Backend.setAppInitialized(true)
  Backend.setAppState(appStates.idle)
}

const checkOnBoot = () => {
  // Apply check on boot setting
  if (Settings.checkOnBootEnabled) {
    var date = new Date()
    date.setMinutes(date.getMinutes() - Settings.updateInterval)
    Settings.lastCheckTimestamp = date
  }
}

const UpdateAllPackages = async () => {
  let success = await Backend.UpdateAllPackages()
  if (!success) {
    console.log('Failed to auto-update all packages, retrying in 5 seconds...')
    setTimeout(UpdateAllPackages, 5000)
  }
}

const onQueueCompletion = ((e: CustomEvent) => {
  let queueRetCode: {action: string, retcode: boolean}[] = e.detail.queueRetCode
  let successes = 0
  queueRetCode.map(item => {
    if (item.retcode) successes += 1
  })
  let notificationText = `${successes}/${queueRetCode.length} packages modified`
  // let installs = 0
  // let updates = 0
  // let removals = 0
  // let queueLength = 0
  // for (let item of queueRetCode) {
  //   if (['install', 'update', 'uninstall'].includes(item.action)) queueLength += 1
  //   if (item.action == 'install' && item.retcode) installs += 1
  //   if (item.action == 'update' && item.retcode) updates += 1
  //   if (item.action == 'uninstall' && item.retcode) removals += 1
  // }
  // if (!installs && !updates && !removals) return
  // let notificationText = ''
  // if (installs) notificationText += `Installed: ${installs} `
  // if (updates) notificationText += `Updated: ${updates} `
  // if (removals) notificationText += `Removed: ${removals} `
  // notificationText += `out of ${queueLength} packages`
  SteamUtils.notify('AutoFlatpaks', notificationText)
}) as EventListener

const IntervalCheck = (() => {
  (async () => {
    if (!Backend.getAppInitialized()) return
    let currentTime = new Date()
    if (!((currentTime.getTime() - Settings.lastCheckTimestamp.getTime())/1000/60 > Settings.updateInterval)) return
    // Time to check for updates
    let package_count = await Backend.getPackageCount()
    Settings.lastCheckTimestamp = currentTime
    await Settings.saveLastCheckTimestamp()
    if (!package_count) return
    if (Settings.unattendedUpgradesEnabled) {
      SteamUtils.notify('AutoFlatpaks', `Updating ${package_count} packages...`)
      UpdateAllPackages()
    } else {
      SteamUtils.notify('AutoFlatpaks', `${package_count} updates available`)
    }
  })()
}) as EventListener

export default definePlugin((serverApi: ServerAPI) => {
  Backend.initBackend(serverApi)
  serverApi.routerHook.addRoute("/flatpak-manager", FlatpakManager)
  initPlugin()
  Backend.eventBus.addEventListener('BatteryStateChange', IntervalCheck)
  Backend.eventBus.addEventListener('QueueCompletion', onQueueCompletion)

  return {
    title: <div className={staticClasses.Title}>AutoFlatpaks</div>,
    content: <QAMPanel />,
    icon: <FaBox />,
    onDismount: () => {
      serverApi.routerHook.removeRoute('/flatpak-manager')
      Backend.eventBus.removeEventListener('BatteryStateChange', IntervalCheck)
      Backend.eventBus.removeEventListener('QueueCompletion', onQueueCompletion)
      Backend.onDismount()
    }
  }
})

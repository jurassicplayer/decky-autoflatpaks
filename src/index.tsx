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
import { events } from "./Utils/Events"
import { SteamUtils } from "./Utils/SteamUtils"
import { queueRetCode } from "./Utils/Backend.d";

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
    // console.warn('[AutoFlatpaks] Failed to auto-update all packages') // , retrying in 5 seconds...')
    // Cleaning up setTimeout requires setting a variable and then calling clearTimeout(timeoutID)
    // setTimeout(UpdateAllPackages, 5000)
  }
}

const onQueueCompletion = (e: Event) => {
  let queueRetCode = (e as events.QueueCompletionEvent).queueRetCode
  let successes = 0
  let failures: queueRetCode[] = []
  queueRetCode.map(item => {
    if (item.retcode) successes += 1
    else failures.push(item)
  })
  let notificationText = `${successes}/${queueRetCode.length} packages modified`
  if (failures.length > 0) console.warn('[AutoFlatpaks] Failed:', failures)
  SteamUtils.notify('AutoFlatpaks', notificationText)
}
const IntervalCheck = async () => {
  if (!Backend.getAppInitialized()) return
  // check if network connected
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
}

export default definePlugin((serverApi: ServerAPI) => {
  Backend.initBackend(serverApi)
  serverApi.routerHook.addRoute("/flatpak-manager", FlatpakManager)
  initPlugin()
  Backend.eventBus.addEventListener(events.BatteryStateEvent.eType, IntervalCheck)
  Backend.eventBus.addEventListener(events.QueueCompletionEvent.eType, onQueueCompletion)

  return {
    title: <div className={staticClasses.Title}>AutoFlatpaks</div>,
    content: <QAMPanel />,
    icon: <FaBox />,
    onDismount: () => {
      serverApi.routerHook.removeRoute('/flatpak-manager')
      Backend.eventBus.removeEventListener(events.BatteryStateEvent.eType, IntervalCheck)
      Backend.eventBus.removeEventListener(events.QueueCompletionEvent.eType, onQueueCompletion)
      Backend.onDismount()
    }
  }
})

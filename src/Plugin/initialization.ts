import { context, EAppState } from "./context"
import { Settings } from "./settings"
import { getLocalStorage, LocalStorageKey, setLocalStorage } from "./localstorage"
import { addRoutes, removeRoutes } from "./routes"
export async function initialize() {
  addRoutes()
  initializeSettings()
  initializeContext()
}

export function deinitialize() {
  removeRoutes()
  dismountContext()
}

export function initializeContext() {
  context.appState = EAppState.INITIALIZECONTEXT
  context.timer = setInterval(intervalCheck, 30000) // check every 30 seconds
  checkOnBoot()
}
export function dismountContext() {
  // @ts-ignore
  if (context.timer) clearInterval(context.timer)
}

const checkOnBoot = () => {
  if (Settings.checkOnBoot) {
    var date = new Date()
    date.setMinutes(date.getMinutes() - getLocalStorage(LocalStorageKey.lastCheckTimestamp, date))
    setLocalStorage(LocalStorageKey.lastCheckTimestamp, date)
  }
}

async function intervalCheck() {
  if (!context.isInitialized || context.appState != EAppState.IDLE) return
  // Check network connectivity
  let currentDate = new Date()
  if (!((currentDate.getTime() - getLocalStorage(LocalStorageKey.lastCheckTimestamp, currentDate).getTime())/1000/60 > Settings.updateInterval)) return
  setLocalStorage(LocalStorageKey.lastCheckTimestamp, currentDate)
}




export function initializeSettings() {
  context.appState = EAppState.INITIALIZESETTINGS
  Settings.updateInterval = 600
}
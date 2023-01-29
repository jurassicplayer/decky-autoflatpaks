import { Focusable } from "decky-frontend-lib"
import { CSSProperties, useEffect, useState, VFC } from "react"
import { appStates, Backend } from "../../Utils/Backend"
import { events } from "../../Utils/Events"
import { SteamCssVariables } from "../../Utils/SteamUtils"

const StatusBarBase: CSSProperties = {
  background: SteamCssVariables.customStatusRed,
  borderRadius: SteamCssVariables.gpCornerMedium,
  padding: "10px 10px 10px 20px"
}
const StatusBarCSS: {[key: string]: CSSProperties} = {
  Default: {
    display: "none"
  },
  Warning: {
    ...StatusBarBase,
    background: SteamCssVariables.customStatusRed
  }
}

export const AdvancedStatusBar: VFC<{statusBar: boolean}> = (props) => {
  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const showStatusBar = props.statusBar
  const onAppStateChange = (e: Event) => {
    let event = e as events.AppStateEvent
    setAppState(event.appState)
  }

  useEffect(() => {
    Backend.eventBus.addEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])
  useEffect(() => () => {
    Backend.eventBus.removeEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])

  let StatusText = ""
  let CSS = StatusBarCSS.Default
  if (appState == appStates.repairingPackages) {
    StatusText = "[Performing Action] Repairing packages..."
    CSS = StatusBarCSS.Warning
  } else if (appState == appStates.migratingAppData) {
    StatusText = "[Performing Action] Moving application data..."
    CSS = StatusBarCSS.Warning
  } else if (showStatusBar) {
    StatusText = "[Error] Please close any running flatpaks before proceeding."
    CSS = StatusBarCSS.Warning
  }

  return (
    <Focusable>
      { appState != appStates.idle || showStatusBar 
      ? <Focusable
        style={CSS}>
        {StatusText}
      </Focusable>
      : null }
    </Focusable>
  )}
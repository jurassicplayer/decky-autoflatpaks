import { Focusable } from "decky-frontend-lib"
import { useEffect, useState, VFC } from "react"
import { FaDownload, FaTrashAlt, FaSyncAlt, FaEye, FaEyeSlash } from "react-icons/fa"
import { ToggleButton } from "../../InputControls/ToggleButton"
import { Card } from "./FlatpakCard.css"
import { appStates, Backend, queueData } from "../../Utils/Backend"
import { FlatpakMetadata } from "../../Utils/Flatpak"

export const FlatpakCardInfo: VFC<{data: FlatpakMetadata}> = (props) => {
  const [packageInfo, setPackageInfo] = useState<FlatpakMetadata>(props.data)
  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const [maskToggled, setMaskToggled] = useState<boolean>(false)
  const [updateToggled, setUpdateToggled] = useState<boolean>(false)
  const [installToggled, setInstallToggled] = useState<boolean>(false)

  const resetToggles = () => {
    setMaskToggled(Backend.getQueue().filter(item => item.packageRef == packageInfo.ref && (item.action.includes('mask') || item.action.includes('unmask'))).length > 0 || false)
    setUpdateToggled(Backend.getQueue().filter(item => item.packageRef == packageInfo.ref && (item.action.includes('update') || item.action.includes('update'))).length > 0 || false)
    setInstallToggled(Backend.getQueue().filter(item => item.packageRef == packageInfo.ref && (item.action.includes('install') || item.action.includes('uninstall'))).length > 0 || false)
  }
  const onPackageInfoChange = ((e: CustomEvent) => {
    if (!e.detail.packageInfo) return
    console.log('Event (', packageInfo.ref,'): ', e.detail.packageInfo)
    setPackageInfo(e.detail.packageInfo)
    resetToggles()
  }) as EventListener
  const onAppStateChange = ((e: CustomEvent) => {
    if (!e.detail.state) return
    console.log('Event (AppState): ', packageInfo.ref)
    setAppState(e.detail.state)
  }) as EventListener

  const queueActions: {[key: string]: queueData} = {
    mask:       { action: 'mask', packageRef: packageInfo.ref },
    unmask:     { action: 'unmask', packageRef: packageInfo.ref },
    update:     { action: 'update', packageRef: packageInfo.ref },
    install:    { action: 'install', packageRef: packageInfo.ref },
    uninstall:  { action: 'uninstall', packageRef: packageInfo.ref }
  }

  useEffect(() => {
    resetToggles()
    console.log("Card info loaded: ", packageInfo.ref)
    // Register listeners
    Backend.eventBus.addEventListener(packageInfo.ref, onPackageInfoChange)
    Backend.eventBus.addEventListener('AppStateChange', onAppStateChange)
  }, [])
  useEffect(() => () => {
    // Unregister listeners
    Backend.eventBus.removeEventListener(packageInfo.ref, onPackageInfoChange)
    Backend.eventBus.removeEventListener('AppStateChange', onAppStateChange)
    console.log("Card info unloaded: ", packageInfo.ref)
  }, [])

  return (
    <Focusable style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", minWidth: "100%" }}>
      <div className="FlatpakInfo"
        style={{ display: "flex", flexDirection: "column", overflow: "scroll" }}
        flow-children="vertical">
        <div>{packageInfo.name}</div>
        <div>{packageInfo.description}</div>
      </div>
      <Focusable
        style={{ display: "inline-flex" }}
        flow-children="horizontal">
        <ToggleButton
          toggledCSS={Card.maskToggled}
          disabled={appState != appStates.idle}
          value={maskToggled}
          onOKActionDescription={maskToggled ? 'Dequeue' : 'Queue' }
          onClick={()=>{
            if (appState != appStates.idle) return
            setMaskToggled(!maskToggled)
            maskToggled
              ? Backend.dequeueAction(packageInfo.masked ? queueActions.unmask : queueActions.mask)
              : Backend.queueAction(packageInfo.masked ? queueActions.unmask : queueActions.mask)
          }}>
          { packageInfo.masked ? <FaEyeSlash /> : <FaEye /> }
        </ToggleButton>
        { packageInfo.updateable
        ? <ToggleButton
            toggledCSS={Card.installToggled}
            disabled={installToggled || appState != appStates.idle}
            value={updateToggled}
            onOKActionDescription={updateToggled ? 'Dequeue' : 'Queue' }
            onClick={()=>{
              if (appState != appStates.idle) return
              setUpdateToggled(!updateToggled)
              updateToggled
                ? Backend.dequeueAction(queueActions.update)
                : Backend.queueAction(queueActions.update)
            }}>
            <FaSyncAlt />
          </ToggleButton>
        : null }
        <ToggleButton toggledCSS={packageInfo.installed ? Card.uninstallToggled : Card.installToggled}
          disabled={updateToggled || appState != appStates.idle}
          value={installToggled}
          onOKActionDescription={installToggled ? 'Dequeue' : 'Queue' }
          onClick={()=>{
            if (appState != appStates.idle) return
            setInstallToggled(!installToggled)
            installToggled
              ? Backend.dequeueAction(packageInfo.installed ? queueActions.uninstall : queueActions.install)
              : Backend.queueAction(packageInfo.installed ? queueActions.uninstall : queueActions.install)
          }}>
          { packageInfo.installed ? <FaTrashAlt /> : <FaDownload /> }
        </ToggleButton>
      </Focusable>
    </Focusable>
  )
}




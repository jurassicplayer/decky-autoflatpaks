import { DialogButton, Focusable, showModal } from "decky-frontend-lib"
import { useEffect, useState, VFC } from "react"
import { FaDownload, FaTrashAlt, FaSyncAlt, FaEye, FaEyeSlash } from "react-icons/fa"
import { ToggleButton } from "../../InputControls/ToggleButton"
import { appStates, Backend } from "../../Utils/Backend"
import { queueData } from "../../Utils/Backend.d"
import { FlatpakMetadata } from "../../Utils/Flatpak"
import { CardButton, CardInfo } from "./FlatpakCardInfo.css"
import { FallbackModal } from "../../InputControls/FallbakModal"
import { events } from "../../Utils/Events"


export const FlatpakInfoModal: VFC<{data: FlatpakMetadata, closeModal?: CallableFunction}> = (props) => {
  return (
    <FallbackModal
      bAllowFullSize={false}
      closeModal={()=>{ if (props.closeModal) props.closeModal() }}>
      <Focusable>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><div>Name: {props.data.name}</div><div>Installed Size: {props.data.installed_size}</div></div>
        <div>Reference: {props.data.ref}</div>
        <div>Description: {props.data.description}</div>
      </Focusable>
    </FallbackModal>
  )
}

export const FlatpakCardInfo: VFC<{data: FlatpakMetadata, focus: boolean}> = (props) => {
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
  const onPackageInfoChange = (e: Event) => {
    setPackageInfo((e as events.PackageInfoEvent).packageInfo)
    resetToggles()
  }
  const onAppStateChange = (e: Event) => { setAppState((e as events.AppStateEvent).appState) }

  const queueActions: {[key: string]: queueData} = {
    mask:       { action: 'mask', packageRef: packageInfo.ref },
    unmask:     { action: 'unmask', packageRef: packageInfo.ref },
    update:     { action: 'update', packageRef: packageInfo.ref },
    install:    { action: 'install', packageRef: packageInfo.ref },
    uninstall:  { action: 'uninstall', packageRef: packageInfo.ref }
  }

  useEffect(() => {
    resetToggles()
    // Register listeners
    Backend.eventBus.addEventListener(packageInfo.ref, onPackageInfoChange)
    Backend.eventBus.addEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])
  useEffect(() => () => {
    // Unregister listeners
    Backend.eventBus.removeEventListener(packageInfo.ref, onPackageInfoChange)
    Backend.eventBus.removeEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])

  return (
    <Focusable style={CardInfo.container}>
      <DialogButton
        style={props.focus ? CardInfo.focus : CardInfo.blur}
        onClick={() => {showModal(<FlatpakInfoModal data={props.data} />)}}>
        <div>{packageInfo.name}</div>
        <div>{packageInfo.description}</div>
      </DialogButton>
      <Focusable
        style={{ display: "inline-flex" }}
        flow-children="horizontal">
        <ToggleButton
          toggledCSS={CardButton.maskToggled}
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
            toggledCSS={CardButton.installToggled}
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
        <ToggleButton toggledCSS={packageInfo.installed ? CardButton.uninstallToggled : CardButton.installToggled}
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




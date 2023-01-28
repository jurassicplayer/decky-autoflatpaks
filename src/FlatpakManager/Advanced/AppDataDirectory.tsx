import { DialogButton, Focusable, staticClasses } from "decky-frontend-lib"
import { CSSProperties, useEffect, useState, VFC } from "react"
import { FaFolderOpen, FaSave } from "react-icons/fa"
import { ButtonStyle, LabelContainer, RowContainer } from "../../InputControls/LabelControls"
import { appStates, Backend } from "../../Utils/Backend"
import { events } from "../../Utils/Events"
import { SteamCssVariables } from "../../Utils/SteamUtils"

const emphasis: CSSProperties = {
  background: SteamCssVariables.gpBackgroundNeutralLightSoft,
  borderRadius: SteamCssVariables.gpCornerLarge,
  padding: '0px 6px 1px 6px',
  color: SteamCssVariables.gpBackgroundNeutralLightHard
}

export const AppDataDirectory: VFC<{setShowStatusBar: CallableFunction}> = (props) => {
  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const [appDataDir, setAppDataDir] = useState<string>('')
  const [selectedAppDataDir, setSelectedAppDataDir] = useState<string>('')
  const onAppStateChange = (e: Event) => { setAppState((e as events.AppStateEvent).appState) }

  useEffect(() => {
    Backend.getAppDataDir().then(path => { 
      setAppDataDir(path)
      setSelectedAppDataDir(path)
    })
    Backend.eventBus.addEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])
  useEffect(() => () => {
    Backend.eventBus.removeEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])

  return (
    <Focusable
      style={RowContainer}>
      <div style={LabelContainer}>
        <div className={staticClasses.Text}>AppData Directory: <span style={emphasis}>{selectedAppDataDir}</span></div>
        <div className={staticClasses.Label}>Location of the flatpak app data directory. The path is <span style={emphasis}>~/.var/app</span> by default</div>
      </div>
      <DialogButton
        style={ButtonStyle}
        onClick={async () => {
          let newPath = await Backend.getServer().openFilePicker(appDataDir, false)
          setSelectedAppDataDir(newPath.realpath)
        }}><FaFolderOpen /></DialogButton>
      <DialogButton
        style={ButtonStyle}
        disabled={selectedAppDataDir == appDataDir || appState != appStates.idle}
        onClick={() => {
          props.setShowStatusBar(false)
          Backend.getRunningPackages().then((runningPackages) => {
            if (runningPackages.length > 0) {
              props.setShowStatusBar(true)
              //showModal(<RunningPackagesModal runningPackages={runningPackages} />)
            } else {
              //showModal(<RepairPackagesModal />)
              console.log("Create confirmation dialog")
            }
          })}}><FaSave /></DialogButton>
    </Focusable>
  )}
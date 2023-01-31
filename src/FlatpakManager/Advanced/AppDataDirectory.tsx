import { DialogButton, Focusable, showModal, staticClasses } from "decky-frontend-lib"
import { CSSProperties, useEffect, useState, VFC } from "react"
import { FaFolderOpen, FaSave } from "react-icons/fa"
import { FallbackModal } from "../../InputControls/FallbackModal"
import { ButtonStyle, LabelContainer, RowContainer } from "../../InputControls/LabelControls"
import { appStates, Backend } from "../../Utils/Backend"
import { events } from "../../Utils/Events"
import { SteamCssVariables, SteamUtils } from "../../Utils/SteamUtils"
import { RunningPackagesModal } from "./RunningPackages"

const emphasis: CSSProperties = {
  background: SteamCssVariables.gpBackgroundNeutralLightSoft,
  borderRadius: SteamCssVariables.gpCornerLarge,
  padding: '0px 6px 1px 6px',
  color: SteamCssVariables.mainTextColor
}

const migrateAppData = async (currentAppDataDir: string, targetAppDataDir: string) => {
  console.debug(`[AutoFlatpaks] Migrating AppData directory: ${currentAppDataDir} => ${targetAppDataDir}`)
  let output = await Backend.MigrateAppData(currentAppDataDir, targetAppDataDir)
  if (output && !output.returncode) return
  if (output == false) {
    console.debug("[AutoFlatpaks] AppState not idle")
  } else if (output.returncode) {
    console.debug("[AutoFlatpaks] Failed to migrate: ", output.stderr)
    SteamUtils.notify("AutoFlatpaks", "Failed to migrate, check logs for details")
  }
}

const AppDataDirectoryModal = (props: {closeModal?: CallableFunction, currentAppDataDir: string, targetAppDataDir: string}) => {
  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const onAppStateChange = (e: Event) => { setAppState((e as events.AppStateEvent).appState) }
  const closeModal = () => {
    if (props.closeModal) { props.closeModal() }
  }

  useEffect(() => {
    Backend.eventBus.addEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])
  useEffect(() => () => {
    Backend.eventBus.removeEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])

  return (
    <FallbackModal
      bDestructiveWarning={true}
      strTitle='Migrate Flatpak AppData Directory'
      strDescription='WARNING: This procedure WILL overwrite on file conflicts with files from the source directory and symlink the target directory to "~/.var/app". This process may take several minutes to complete and while running, most of AutoFlatpaks functions will be disabled. Also, until websockets is implemented and merged into decky-loader, there will be no indication of progress or resultant output beyond the status bar indicating that the process is still running or complete.'
      bOKDisabled={appState != appStates.idle}
      strOKButtonText='Migrate'
      onOK={() => {
        migrateAppData(props.currentAppDataDir, props.targetAppDataDir)
        closeModal()
      }}
      closeModal={closeModal} />
  )}

export const AppDataDirectory: VFC<{setShowStatusBar: CallableFunction}> = (props) => {
  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const [appDataDir, setAppDataDir] = useState<string>('')
  const [selectedAppDataDir, setSelectedAppDataDir] = useState<string>('')
  const onAppStateChange = (e: Event) => { setAppState((e as events.AppStateEvent).appState) }

  useEffect(() => {
    Backend.getAppDataDirectory().then(path => { 
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
        <div className={staticClasses.Label}>Change the location of the flatpak app data directory. The default location is <span style={emphasis}>~/.var/app</span>. USE AT YOUR OWN RISK</div>
      </div>
      <DialogButton
        style={ButtonStyle}
        disabled={appState == appStates.migratingAppData}
        onClick={async () => {
          let newPath = await Backend.getServer().openFilePicker(appDataDir, false)
          setSelectedAppDataDir(newPath.path)
        }}><FaFolderOpen /></DialogButton>
      <DialogButton
        style={ButtonStyle}
        disabled={selectedAppDataDir == appDataDir || appState != appStates.idle}
        onClick={() => {
          props.setShowStatusBar(false)
          Backend.getRunningPackages().then((runningPackages) => {
            if (runningPackages.length > 0) {
              props.setShowStatusBar(true)
              showModal(<RunningPackagesModal runningPackages={runningPackages} />)
            } else {
              showModal(<AppDataDirectoryModal currentAppDataDir={appDataDir} targetAppDataDir={selectedAppDataDir} />)
            }
          })}}><FaSave /></DialogButton>
    </Focusable>
  )}
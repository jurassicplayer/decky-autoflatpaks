import { DialogButton, Dropdown, Focusable, showModal, staticClasses } from "decky-frontend-lib"
import { useEffect, useState, VFC } from "react"
import { FaArrowRight, FaEllipsisH } from "react-icons/fa"
import { FallbackModal } from "../../InputControls/FallbackModal"
import { ButtonStyle, LabelContainer, RowContainer } from "../../InputControls/LabelControls"
import { appStates, Backend } from "../../Utils/Backend"
import { events } from "../../Utils/Events"
import { Settings } from "../../Utils/Settings"
import { InstallFolderEntry } from "../../Utils/SteamUtils"
import { RunningPackagesModal } from "./RunningPackages"

export const AppDataDirectory: VFC<{setShowStatusBar: CallableFunction}> = (props) => {
  const [componentInit, setComponentInit] = useState<boolean>(false)
  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const [selectedInstallFolder, setSelectedInstallFolder] = useState<InstallFolderEntry>()
  const [installFolders, setInstallFolders] = useState<InstallFolderEntry[]>([])
  const onAppStateChange = (e: Event) => { setAppState((e as events.AppStateEvent).appState) }

  useEffect(() => {
    if (!componentInit) return
    if (selectedInstallFolder?.strDriveName && Settings.appDataLocation != selectedInstallFolder.strDriveName) {
      Settings.appDataLocation = selectedInstallFolder.strDriveName
      Settings.saveToLocalStorage()
    }
  }, [selectedInstallFolder])
  useEffect(() => {
    Backend.getAppDataLocationOrDefault().then(({installFolder, installFolders}) => {
      setSelectedInstallFolder(installFolder)
      setInstallFolders(installFolders)
      setComponentInit(true)
    })
    Backend.eventBus.addEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])
  useEffect(() => () => {
    Backend.eventBus.removeEventListener(events.AppStateEvent.eType, onAppStateChange)
    setComponentInit(false)
  }, [])

  return (
    <Focusable
      style={RowContainer}>
      <div style={LabelContainer}>
        <div className={staticClasses.Text}>Default AppData Location</div>
        <div className={staticClasses.Label}>Change the default location of flatpak app data</div>
      </div>
      <div style={{width: "35%", margin: "auto"}}>
        <Dropdown
          disabled={appState != appStates.idle}
          selectedOption={selectedInstallFolder}
          onChange={(e) => {setSelectedInstallFolder(e.data)}}
          rgOptions={installFolders.map(installFolder => {
            let folderLabel = installFolder.strUserLabel ? installFolder.strUserLabel : installFolder.strDriveName
            return {label: folderLabel, data: installFolder}
          })} />
      </div>
    </Focusable>
  )}





const AppDataMigrationModal = (props: {closeModal?: CallableFunction, selectedSourceFolder: InstallFolderEntry|undefined, selectedDestinationFolder: InstallFolderEntry|undefined}) => {
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
      strDescription='WARNING: This procedure WILL overwrite on file conflicts with files from the source directory and symlink the target directory to "~/.var/app". This process may take several minutes to complete depending on the amount of data to migrate.'
      bOKDisabled={appState != appStates.idle}
      strOKButtonText='Migrate'
      onOK={() => {
        MigrateAllAppData(props.selectedSourceFolder, props.selectedDestinationFolder)
        closeModal()
      }}
      closeModal={closeModal} />
  )}

const installFolderToPathArray = async (installFolder: InstallFolderEntry) => {
  let defaultAppDataDirectory = await Backend.getDefaultAppDataDirectory()
  return installFolder.nFolderIndex == 0 ? [defaultAppDataDirectory] : [installFolder.strDriveName, '.steamos', 'autoflatpaks', 'appdata']
}
const MigrateAllAppData = async (sourceInstall: InstallFolderEntry|undefined, destinationInstall: InstallFolderEntry|undefined) => {
  if (!sourceInstall || !destinationInstall) return
  // Determine/build final folder paths from installFolders and pass in as array for python to join together
  let source = await installFolderToPathArray(sourceInstall)
  let destination = await installFolderToPathArray(destinationInstall)
  await Backend.MigrateAllAppData(source, destination)
}
export const AppDataMigration: VFC<{setShowStatusBar: CallableFunction}> = (props) => {
  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const [selectedSourceFolder, setSelectedSourceFolder] = useState<InstallFolderEntry>()
  const [selectedDestinationFolder, setSelectedDestinationFolder] = useState<InstallFolderEntry>()
  const [installFolders, setInstallFolders] = useState<InstallFolderEntry[]>([])
  const [componentInit, setComponentInit] = useState<boolean>(false)
  const onAppStateChange = (e: Event) => { setAppState((e as events.AppStateEvent).appState) }
  
  useEffect(() => {
    SteamClient.InstallFolder.GetInstallFolders().then((paths: InstallFolderEntry[]) => {
      setInstallFolders(paths)
      Backend.getAppDataLocationOrDefault().then(({installFolder, installFolders}) => {
        setSelectedSourceFolder(installFolder)
        setSelectedDestinationFolder(installFolder)
        setInstallFolders(installFolders)
        setComponentInit(true)
      })
    })
    Backend.eventBus.addEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])
  useEffect(() => () => {
    Backend.eventBus.removeEventListener(events.AppStateEvent.eType, onAppStateChange)
    setComponentInit(false)
  }, [])

  return (
    <Focusable
      style={RowContainer}>
      <div style={LabelContainer}>
        <div className={staticClasses.Text}>Migrate AppData</div>
        <div className={staticClasses.Label}>Migrate all flatpak app data from one location to another. USE AT YOUR OWN RISK</div>
        <div style={RowContainer}>
          <div style={{width: "45%", margin: "auto"}}>
            <Dropdown
              disabled={appState != appStates.idle}
              selectedOption={selectedSourceFolder}
              onChange={(e) => {setSelectedSourceFolder(e.data)}}
              rgOptions={installFolders.map(installFolder => {
                let folderLabel = installFolder.strUserLabel ? installFolder.strUserLabel : installFolder.strDriveName
                return {label: folderLabel, data: installFolder}
              })} />
          </div>
          <div style={{padding: "0% 2% 0% 2%", margin: "auto"}}><FaArrowRight /></div>
          <div style={{width: "45%", margin: "auto"}}>
            <Dropdown
              disabled={appState != appStates.idle}
              selectedOption={selectedDestinationFolder}
              onChange={(e) => {setSelectedDestinationFolder(e.data)}}
              rgOptions={installFolders.map(installFolder => {
                let folderLabel = installFolder.strUserLabel ? installFolder.strUserLabel : installFolder.strDriveName
                return {label: folderLabel, data: installFolder}
              })} />
          </div>
          <DialogButton
            style={ButtonStyle}
            disabled={selectedSourceFolder == selectedDestinationFolder || !componentInit || appState != appStates.idle}
            onClick={() => {
              props.setShowStatusBar(false)
              Backend.getRunningPackages().then((runningPackages) => {
                if (runningPackages.length > 0) {
                  props.setShowStatusBar(true)
                  showModal(<RunningPackagesModal runningPackages={runningPackages} />)
                } else {
                  showModal(<AppDataMigrationModal selectedSourceFolder={selectedSourceFolder} selectedDestinationFolder={selectedDestinationFolder} />)
                }
              })
            }}>
            <FaEllipsisH />
          </DialogButton>
        </div>
      </div>
    </Focusable>
  )}
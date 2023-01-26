import { DialogButton, Focusable, staticClasses } from "decky-frontend-lib"
import { useEffect, useState, VFC } from "react"
import { FaFolderOpen, FaSave } from "react-icons/fa"
import { appStates, Backend } from "../../Utils/Backend"
import { events } from "../../Utils/Events"


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
      style={{
        display: "flex",
        flexDirection: "row"
      }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1
        }}>
        <div className={staticClasses.Text}>AppData Directory:</div>
        <div className={staticClasses.Label}>{selectedAppDataDir}</div>
      </div>
      <DialogButton
        style={{margin:"4px", width: "auto", minWidth: "70px"}}
        onClick={async () => {
          let newPath = await Backend.getServer().openFilePicker(appDataDir, false)
          setSelectedAppDataDir(newPath.realpath)
        }}><FaFolderOpen /></DialogButton>
      <DialogButton
        style={{margin:"4px", width: "auto", minWidth: "70px"}}
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
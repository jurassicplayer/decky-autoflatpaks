import { DialogButton, Focusable, PanelSection, PanelSectionRow, showModal, staticClasses, ToggleField } from "decky-frontend-lib"
import { useEffect, useState, VFC } from "react"
// import { FallbackModal } from "../../InputControls/FallbakModal"
import { appStates, Backend } from "../../Utils/Backend"
import { events } from "../../Utils/Events"
import { Settings } from "../../Utils/Settings"
import { RepairPackagesModal } from "./RepairPackagesModal"
import { UnusedPackagesModal } from "./UnusedPackagesModal"

const checkRunningPackages = async () => {
  let result: (string|undefined)[] = []
  let runningList = await Backend.getRunningPackageList()
  console.log('Running List', runningList)
  if (runningList.length == 0) return result
  let localPackageList = await Backend.getLocalPackageList()
  result = runningList.map(item => localPackageList ? localPackageList.find(LPLItem => LPLItem.application == item.application && LPLItem.branch == item.branch && LPLItem.arch == item.arch)?.name : item.application)
  result = [...new Set(result)]
  return result
}

const AdvancedStatusBar = () => {
  return (
    <Focusable
      style={{
        background: "#7a0a0a",
        borderRadius: "2px",
        padding: "10px 10px 10px 20px"}}>
      [Error] Please close any running flatpaks before proceeding.
    </Focusable>
  )
}
// const RunningPackagesModal = (props: any) => {
//   return (
//     <FallbackModal
//       bDestructiveWarning={true}
//       strTitle='Error: Packages Still Running'
//       strDescription='This procedure would be safer done without any flatpaks running. Please close any running flatpaks first.'
//       bCancelDisabled={true}
//       bMiddleDisabled={true}
//       bAlertDialog={true}
//       closeModal={()=>{
//         if (props.closeModal) { props.closeModal() }
//       }}>
//       {props.runningPackages.sort((a:string, b:string) => a.localeCompare(b)).map((item: string) => 
//         <div>{item}</div>
//       )}
//     </FallbackModal>
//   )
// }

export const AdvancedPage: VFC = () => {
  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const [showStatusBar, setShowStatusBar] = useState<boolean>(false)
  const [aggressiveEnabled, setAggressiveEnabled] = useState<boolean>(Settings.aggressiveEnabled)
  const onAppStateChange = (e: Event) => { setAppState((e as events.AppStateEvent).appState) }
  
  useEffect(() => {
    if (Settings.aggressiveEnabled != aggressiveEnabled) Settings.aggressiveEnabled = aggressiveEnabled;
    Settings.saveToLocalStorage();
  }, [aggressiveEnabled])
  useEffect(() => {
    Backend.eventBus.addEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])
  useEffect(() => () => {
    Backend.eventBus.removeEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])

  return (
    <Focusable>
      <PanelSection>
        <PanelSectionRow>
          { showStatusBar
          ? <AdvancedStatusBar />
          : null }
        </PanelSectionRow>
        <div className={staticClasses.PanelSectionTitle}>Packages</div>
        <PanelSectionRow>
          <DialogButton
            style={{ margin: "4px" }}
            disabled={appState != appStates.idle}
            onClick={() => {showModal(<UnusedPackagesModal/>)}}>
            Unused Packages
          </DialogButton>
          <DialogButton
            style={{ margin: "4px" }}
            disabled={appState != appStates.idle}
            onClick={() => {
              setShowStatusBar(false)
              checkRunningPackages().then((runningPackages) => {
                if (runningPackages.length > 0) {
                  setShowStatusBar(true)
                  //showModal(<RunningPackagesModal runningPackages={runningPackages} />)
                } else {
                  showModal(<RepairPackagesModal />)
                }
              })}}>
            Repair Packages
          </DialogButton>
        </PanelSectionRow>
        <div className={staticClasses.PanelSectionTitle}>Settings</div>
        <PanelSectionRow>
          <ToggleField
            label="Aggressive Package Filtering"
            description="Filter out BaseApp, BaseExtension, Debug, Sources, and EoL packages"
            checked={aggressiveEnabled}
            onChange={(aggressiveEnabled) => {
              setAggressiveEnabled(aggressiveEnabled)
            }}
          />
        </PanelSectionRow>
      </PanelSection>
      <h2>Work In Progress</h2>
      <p>
        This is a tentative area that will be a place for advanced functions that hopefully won't need to be used.
      </p>
      <ul>
        <li>Set/Move flatpak app data directory</li>
        <li>Permissions Manager (GameMode Flatseal-ish maybe?)</li>
        <li>Complex mask handling and controls (?)</li>
      </ul>
    </Focusable>
  )
}
import { Focusable, staticClasses, ToggleField } from "decky-frontend-lib"
import { useEffect, useState, VFC } from "react"
import { Settings } from "../../Utils/Settings"
import { AppDataDirectory } from "./AppDataDirectory"
import { RepairPackages } from "./RepairPackages"
import { UnusedPackages } from "./UnusedPackages"

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
  const [showStatusBar, setShowStatusBar] = useState<boolean>(false)
  const [aggressiveEnabled, setAggressiveEnabled] = useState<boolean>(Settings.aggressiveEnabled)
  
  useEffect(() => {
    if (Settings.aggressiveEnabled != aggressiveEnabled) Settings.aggressiveEnabled = aggressiveEnabled
    Settings.saveToLocalStorage()
  }, [aggressiveEnabled])

  return (
    <Focusable>
      <Focusable>
        <Focusable>
          { showStatusBar
          ? <AdvancedStatusBar />
          : null }
        </Focusable>
        
        <div className={staticClasses.PanelSectionTitle}>Settings</div>
        <Focusable style={{
            width: "95%",
            margin: "auto"
          }}>
          <ToggleField
            label="Aggressive Package Filtering"
            description="Filter out BaseApp, BaseExtension, Debug, Sources, and EoL packages"
            checked={aggressiveEnabled}
            onChange={(aggressiveEnabled) => {
              setAggressiveEnabled(aggressiveEnabled)
            }}/>
          <AppDataDirectory setShowStatusBar={setShowStatusBar}/>
        </Focusable>

        <div className={staticClasses.PanelSectionTitle}>System Maintenance</div>
        <Focusable style={{
            width: "95%",
            margin: "auto"
          }}>
          <UnusedPackages />
          <RepairPackages setShowStatusBar={setShowStatusBar}/>
        </Focusable>

      </Focusable>
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
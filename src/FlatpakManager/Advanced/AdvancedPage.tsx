import { Focusable, staticClasses } from "decky-frontend-lib"
import { CSSProperties, useState, VFC } from "react"
import { SteamCssVariables } from "../../Utils/SteamUtils"
import { AdvancedStatusBar } from "./AdvancedStatusBar"
import { AggressiveFilter } from "./AggressiveFilter"
import { AppDataDirectory, AppDataMigration } from "./AppDataDirectory"
import { RepairPackages } from "./RepairPackages"
import { UnusedPackages } from "./UnusedPackages"

const Separator = () => {
  return (
    <hr style={{
      height: "0.5px",
      margin: "2px 0px 2px 0px",
      borderWidth: "0px",
      background: SteamCssVariables.gpBackgroundNeutralLightSoft
    }}/>
  )}
const SectionStyle: CSSProperties = {
  width: "95%",
  margin: "auto"
}

export const AdvancedPage: VFC = () => {
  const [showStatusBar, setShowStatusBar] = useState<boolean>(false)

  return (
    <Focusable>
      <Focusable>
        <AdvancedStatusBar statusBar={showStatusBar} />
        <div className={staticClasses.PanelSectionTitle}>Settings</div>
        <Focusable style={SectionStyle}>
          <AggressiveFilter />
          <Separator />
          <AppDataDirectory setShowStatusBar={setShowStatusBar}/>
          <Separator />
          <AppDataMigration setShowStatusBar={setShowStatusBar}/>
          <Separator />
        </Focusable>

        <div className={staticClasses.PanelSectionTitle}>System Maintenance</div>
        <Focusable style={SectionStyle}>
          <UnusedPackages />
          <Separator />
          <RepairPackages setShowStatusBar={setShowStatusBar}/>
          <Separator />
        </Focusable>

      </Focusable>
      <h2>Work In Progress</h2>
      <ul>
        <li>Permissions Manager (GameMode Flatseal-ish maybe?)</li>
        <li>Complex mask handling and controls (?)</li>
      </ul>
    </Focusable>
  )
}
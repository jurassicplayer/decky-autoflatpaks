import { useEffect, useState, VFC } from "react"
import { LabelToggle } from "../../InputControls/LabelControls"
import { Settings } from "../../Utils/Settings"

export const AggressiveFilter: VFC = () => {
  const [aggressiveEnabled, setAggressiveEnabled] = useState<boolean>(Settings.aggressiveEnabled)

  useEffect(() => {
    if (Settings.aggressiveEnabled != aggressiveEnabled) Settings.aggressiveEnabled = aggressiveEnabled
    Settings.saveToLocalStorage()
  }, [aggressiveEnabled])

  return (
    <LabelToggle
      label="Aggressive Package Filtering"
      description="Filter out BaseApp, BaseExtension, Debug, Sources, and EoL packages"
      value={aggressiveEnabled}
      onChange={(aggressiveEnabled) => {
        setAggressiveEnabled(aggressiveEnabled)
      }}/>
  )}
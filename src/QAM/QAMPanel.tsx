import { VFC, useEffect, useState } from "react"
import { 
  DialogButton,
  ToggleField,
  Focusable,
  PanelSection,
  PanelSectionRow,
  Router,
  staticClasses
} from "decky-frontend-lib"
import { Spinner } from "../InputControls/Spinner"
import { NotificationToggles } from "../InputControls/NotificationToggles"
import { FaBoxOpen, FaRedoAlt, FaDownload } from "react-icons/fa"
import { Settings } from "../Utils/Settings"
import { Backend } from "../Utils/Backend"
import { SteamUtils } from "../Utils/SteamUtils"
import { FlatpakManagerButtons } from "./QAMPanel.css"

export const QAMPanel: VFC = () => {
  //#region Helper Functions
  const splitMinutes = (interval: number) => {
    const days = Math.floor(interval/(24*60))
    const hours = Math.floor((interval%(24*60))/60)
    const minutes = Math.floor((interval%(24*60))%60)
    return ({'d': days, 'h': hours, 'm': minutes})
  }
  const getAppState = async () => { setState(Backend.getAppState()) }
  //#endregion

  //#region Variables
  const [checkOnBootEnabled, setCheckOnBootEnabled] = useState<boolean>(Settings.checkOnBootEnabled);
  const [unattendedUpgradesEnabled, setUnattendedUpgradesEnabled] = useState<boolean>(Settings.unattendedUpgradesEnabled);
  const [interval, setIntervalTime] = useState<number>(Settings.updateInterval);
  var splitTime = splitMinutes(interval);
  const [dayDuration, setDayDuration] = useState<number>(splitTime.d);
  const [hourDuration, setHourDuration] = useState<number>(splitTime.h);
  const [minuteDuration, setMinuteDuration] = useState<number>(splitTime.m);
  const [state, setState] = useState<string>(Backend.getAppState())
  //#endregion

  //#region Input Functions
  const onOpenFlatpakManager = async () => {
    await Backend.long_process()
    Router.CloseSideMenus()
    Router.Navigate("/flatpak-manager")
  }
  const onCheckForUpdates = async () => {
    var package_count = await Backend.getPackageCount()
    if (package_count != undefined)
      SteamUtils.notify('AutoFlatpaks', `${package_count} updates available`)
  }
  const onUpdateAllPackages = async () => {
    var output = await Backend.UpdateAllPackages()
    if (output != undefined)
    SteamUtils.notify('AutoFlatpaks', 'Updated all packages')
  }


  const onDaySpinnerUp   = () => { setDayDuration(dayDuration+1) }
  const onDaySpinnerDown = () => { if (dayDuration) setDayDuration(dayDuration-1) }
  const onHrsSpinnerUp   = () => { if (hourDuration < 24) setHourDuration(hourDuration+1) }
  const onHrsSpinnerDown = () => { if (hourDuration) setHourDuration(hourDuration-1) }
  const onMinSpinnerUp   = () => { if (minuteDuration < 60) setMinuteDuration(minuteDuration+1) }
  const onMinSpinnerDown = () => { if (minuteDuration) setMinuteDuration(minuteDuration-1) }

  setInterval(() => getAppState(), 100)
  //#endregion

  //#region Effects
  useEffect(() => { setIntervalTime((dayDuration * 24 * 60)+(hourDuration * 60)+minuteDuration) }, [dayDuration, hourDuration, minuteDuration])
  useEffect(() => {
    if (Settings.checkOnBootEnabled != checkOnBootEnabled) Settings.checkOnBootEnabled = checkOnBootEnabled;
    if (Settings.unattendedUpgradesEnabled != unattendedUpgradesEnabled) Settings.unattendedUpgradesEnabled = unattendedUpgradesEnabled;
    if (Settings.updateInterval != interval) Settings.updateInterval = interval;
    Settings.saveToLocalStorage();
  }, [checkOnBootEnabled, unattendedUpgradesEnabled, interval]);
  //#endregion

  //#region Dynamic Layout
  const StatusBar = () => {
    let StatusText = ""
    let bgColor = "#0b6f4c"
    if (state == "CheckForUpdates") {
      StatusText = "Checking for updates..."
    } else if (state == "UpdatingFlatpaks") {
      StatusText = "Updating flatpaks..."
      bgColor = "#7a0a0a"
    }
    return (
      <PanelSectionRow>
        <div className={staticClasses.PanelSectionTitle} style={{ backgroundColor: bgColor, color: "#FFFFFF" }}>{StatusText}</div>
      </PanelSectionRow>
    )
  }
  //#endregion
  
  //#region Layout
  return (
    <PanelSection>
      {state != "Idle" ? <StatusBar /> : null}
      <PanelSectionRow>
        <Focusable style={{ display: "flex" }} flow-children="horizontal">
          <DialogButton style={FlatpakManagerButtons} disabled={state != "Idle"} onClick={onOpenFlatpakManager}><FaBoxOpen /></DialogButton>
          <DialogButton style={FlatpakManagerButtons} disabled={state != "Idle"} onClick={onCheckForUpdates}><FaRedoAlt /></DialogButton>
          <DialogButton style={FlatpakManagerButtons} disabled={state != "Idle"} onClick={onUpdateAllPackages}><FaDownload /></DialogButton>
        </Focusable>
      </PanelSectionRow>

      <div className={staticClasses.PanelSectionTitle}>Update Interval</div>
      <PanelSectionRow>
        <div style={{ display: "none" }}>{/* Fixes strange styling issue */}</div>
        <Spinner label="Day" value={dayDuration} onClickUp={onDaySpinnerUp} onClickDown={onDaySpinnerDown} />
        <Spinner label="Hrs" value={hourDuration} onClickUp={onHrsSpinnerUp} onClickDown={onHrsSpinnerDown} />
        <Spinner label="Min" value={minuteDuration} onClickUp={onMinSpinnerUp} onClickDown={onMinSpinnerDown} />
      </PanelSectionRow>

      <div className={staticClasses.PanelSectionTitle}>Settings</div>
      <PanelSectionRow>
        <ToggleField
          label="Check on Boot"
          checked={checkOnBootEnabled}
          onChange={(checkOnBootEnabled) => {
            setCheckOnBootEnabled(checkOnBootEnabled);
          }}
        />
      </PanelSectionRow>

      <PanelSectionRow>
        <ToggleField
          label="Unattended Upgrades"
          checked={unattendedUpgradesEnabled}
          onChange={(unattendedUpgradesEnabled) => {
            setUnattendedUpgradesEnabled(unattendedUpgradesEnabled);
          }}
        />
      </PanelSectionRow>

      <div className={staticClasses.PanelSectionTitle}>Notifications</div>
      <PanelSectionRow>
        <NotificationToggles />
      </PanelSectionRow>
    </PanelSection>
  )
  //#endregion
}

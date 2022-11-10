import {
  definePlugin,
  Toggle,
  ToggleField,
  DialogButton,
  Focusable,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  staticClasses,
  Button
} from "decky-frontend-lib";
import { VFC, useState, useEffect } from "react";
import { FaBox, FaRedoAlt, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { MdSystemUpdateAlt } from "react-icons/md";
import { loadSettingsFromLocalStorage, Settings, saveSettingsToLocalStorage } from "./settings";
import { Backend } from "./utils";

let settings: Settings;

const Content: VFC<{ settings: Settings, backend: Backend }> = ({ settings, backend }) => {
  const splitMinutes = (interval: number) => {
    const days = Math.floor(interval/(24*60))
    const hours = Math.floor((interval%(24*60))/60)
    const minutes = Math.floor((interval%(24*60))%60)
    return ({'d': days, 'h': hours, 'm': minutes})
  }

  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(settings.notificationEnabled);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled);
  const [checkOnBootEnabled, setCheckOnBootEnabled] = useState<boolean>(settings.checkOnBootEnabled);
  const [unattendedUpgradesEnabled, setUnattendedUpgradesEnabled] = useState<boolean>(settings.unattendedUpgradesEnabled);
  const [interval, setInterval] = useState<number>(settings.updateInterval);
  var splitTime = splitMinutes(interval);
  const [dayDuration, setDayDuration] = useState<number>(splitTime.d);
  const [hourDuration, setHourDuration] = useState<number>(splitTime.h);
  const [minuteDuration, setMinuteDuration] = useState<number>(splitTime.m);
  
  useEffect(() => {
    if (settings.soundEnabled != soundEnabled) settings.soundEnabled = soundEnabled;
    if (settings.notificationEnabled != notificationEnabled) settings.notificationEnabled = notificationEnabled;
    if (settings.checkOnBootEnabled != checkOnBootEnabled) settings.checkOnBootEnabled = checkOnBootEnabled;
    if (settings.unattendedUpgradesEnabled != unattendedUpgradesEnabled) settings.unattendedUpgradesEnabled = unattendedUpgradesEnabled;
    if (settings.updateInterval != interval) settings.updateInterval = interval;
    saveSettingsToLocalStorage(settings);
  }, [soundEnabled, notificationEnabled, checkOnBootEnabled, unattendedUpgradesEnabled, interval]);

  useEffect(() => {
    setInterval((dayDuration * 24 * 60)+(hourDuration * 60)+minuteDuration)
  }, [dayDuration, hourDuration, minuteDuration])
  

  return (
    <PanelSection>
      <PanelSectionRow>
        <Focusable
          style={{ marginTop: "5px", marginBottom: "5px", display: "flex" }}
          flow-children="horizontal">
          <DialogButton
            style={{minWidth:"0"}}
            onClick={async () => {
              backend.notify('AutoFlatpaks', 'Checking for updates...', settings.notificationEnabled, settings.soundEnabled, 3000)
              var package_count = await backend.getPackageCount();
              backend.notify('AutoFlatpaks', `${package_count} updates available`, settings.notificationEnabled, settings.soundEnabled, 5000)
            }}
          ><FaRedoAlt /></DialogButton><DialogButton
            style={{minWidth:"0"}}
            onClick={() => {
              backend.notify('AutoFlatpaks', 'Updating all packages...', settings.notificationEnabled, settings.soundEnabled)
              backend.updateAllPackages(true);
            }}
          ><MdSystemUpdateAlt /></DialogButton>
        </Focusable>
      </PanelSectionRow>

      <div className={staticClasses.PanelSectionTitle}>Update Interval</div>
      <PanelSectionRow>
      <div className={staticClasses.PanelSectionTitle} style={{ minHeight: "0px" }}></div>
        <div style={{ minHeight: "0px", marginLeft: "0px", marginRight: "0px", display: "flex", justifyContent: "space-between" }} flow-children="horizontal">
          <div className={staticClasses.PanelSectionTitle}>Day</div>
          <div className={staticClasses.PanelSectionTitle}>{dayDuration}</div>
          <Focusable
            style={{ minHeight: "0px", marginLeft: "0px", marginRight: "0px", display: "flex", justifyContent: "space-evenly" }}
            flow-children="vertical">
            <Button style={{minHeight: '0'}} onClick={()=>{setDayDuration(dayDuration+1)}}><FaArrowUp/></Button>
            <Button style={{minHeight: '0'}} onClick={()=>{if (dayDuration) setDayDuration(dayDuration-1)}}><FaArrowDown/></Button>
          </Focusable>
        </div>
        <div style={{ minHeight: "0px", marginLeft: "0px", marginRight: "0px", display: "flex", justifyContent: "space-between" }} flow-children="horizontal">
          <div className={staticClasses.PanelSectionTitle}>Hrs</div>
          <div className={staticClasses.PanelSectionTitle}>{hourDuration}</div>
          <Focusable
            style={{ minHeight: "0px", marginLeft: "0px", marginRight: "0px", display: "flex", justifyContent: "space-evenly" }}
            flow-children="vertical">
            <Button style={{minHeight: '0'}} onClick={()=>{if (hourDuration < 24) setHourDuration(hourDuration+1)}}><FaArrowUp/></Button>
            <Button style={{minHeight: '0'}} onClick={()=>{if (hourDuration) setHourDuration(hourDuration-1)}}><FaArrowDown/></Button>
          </Focusable>
        </div>
        <div style={{ minHeight: "0px", marginLeft: "0px", marginRight: "0px", display: "flex", justifyContent: "space-between" }} flow-children="horizontal">
          <div className={staticClasses.PanelSectionTitle}>Min</div>
          <div className={staticClasses.PanelSectionTitle}>{minuteDuration}</div>
          <Focusable
            style={{ minHeight: "0px", marginLeft: "0px", marginRight: "0px", display: "flex", justifyContent: "space-evenly" }}
            flow-children="vertical">
            <Button style={{minHeight: '0'}} onClick={()=>{if (minuteDuration < 60) setMinuteDuration(minuteDuration+5)}}><FaArrowUp/></Button>
            <Button style={{minHeight: '0'}} onClick={()=>{if (minuteDuration) setMinuteDuration(minuteDuration-5)}}><FaArrowDown/></Button>
          </Focusable>
        </div>
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

      <PanelSectionRow>
        <div style={{ minHeight: "0px", marginTop: "0px", marginBottom: "0px", display: "flex", justifyContent: "space-between" }} flow-children="horizontal">
          <div className={staticClasses.PanelSectionTitle}>Toast</div><div className={staticClasses.PanelSectionTitle}>Sound</div>
        </div>
        <Focusable
          style={{ minHeight: "0px", marginLeft: "25px", marginRight: "25px", display: "flex", justifyContent: "space-between" }}
          flow-children="horizontal">
          <Toggle
            value={notificationEnabled}
            onChange={(notificationEnabled) => {
              setNotificationEnabled(notificationEnabled);
            }}
          />
          <Toggle
            value={soundEnabled}
            onChange={(soundEnabled) => {
              setSoundEnabled(soundEnabled);
            }}
          />
        </Focusable>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  // load settings
  settings = loadSettingsFromLocalStorage()
  const backend = new Backend(serverApi, settings)

  if (settings.checkOnBootEnabled) {
    var date = new Date()
    date.setMinutes(date.getMinutes() - settings.updateInterval)
    settings.lastCheckTimestamp = date
  }

  // interval check loop
  SteamClient.System.RegisterForBatteryStateChanges(async ()=> {
    var currentTime = new Date()
    if (!((currentTime.getTime() - settings.lastCheckTimestamp.getTime())/1000/60 > settings.updateInterval)) return
    // Time to check for updates
    settings.lastCheckTimestamp = currentTime
    var package_count = await backend.getPackageCount()
    if (!package_count) return
    var notificationText = `${package_count} updates available`
    if (settings.unattendedUpgradesEnabled) {
      notificationText = `Updating ${package_count} packages...`
      backend.updateAllPackages()
    }
    backend.notify('AutoFlatpaks', notificationText)
  })

  return {
    title: <div className={staticClasses.Title}>AutoFlatpaks</div>,
    content: <Content settings={settings} backend={backend}/>,
    icon: <FaBox />,
  };
});

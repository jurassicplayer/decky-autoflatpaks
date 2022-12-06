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
import { appStates, Backend } from "../Utils/Backend"
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
  //#endregion

  //#region Variables
  const [checkOnBootEnabled, setCheckOnBootEnabled] = useState<boolean>(Settings.checkOnBootEnabled);
  const [unattendedUpgradesEnabled, setUnattendedUpgradesEnabled] = useState<boolean>(Settings.unattendedUpgradesEnabled);
  const [interval, setIntervalTime] = useState<number>(Settings.updateInterval);
  var splitTime = splitMinutes(interval);
  const [dayDuration, setDayDuration] = useState<number>(splitTime.d);
  const [hourDuration, setHourDuration] = useState<number>(splitTime.h);
  const [minuteDuration, setMinuteDuration] = useState<number>(splitTime.m);
  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const [queueProgress, setQueueProgress] = useState<{[key: string]: any}>({
    currentItem: Backend.getQueue()[0],
    queueProgress: Backend.getQueueProgress(),
    queueLength: Backend.getQueueLength()
  })
  //#endregion

  //#region Input Functions
  const onTestProcess = async () => {
    Backend.long_process()
  }
  const onOpenFlatpakManager = async () => {
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

  const onQueueProgress = ((e: CustomEvent) => {
    if (!e.detail.queueLength) return
    console.log('Event (QueueProgress): ', e.detail)
    setQueueProgress({
      currentItem: e.detail.queueItem,
      queueProgress: Number(e.detail.queueProgress),
      queueLength: Number(e.detail.queueLength)
    })
  }) as EventListener
  const onQueueCompletion = ((e: CustomEvent) => {
    if (!e.detail.queueLength) return
    console.log('Event (QueueCompletion): ', e.detail)
    setQueueProgress({
      currentItem: undefined,
      queueProgress: undefined,
      queueLength: undefined
    })
  }) as EventListener
  const onAppStateChange = ((e: CustomEvent) => {
    if (!e.detail.state) return
    console.log('Event (AppState): QAM Panel')
    setAppState(e.detail.state)
  }) as EventListener
  const onDaySpinnerUp   = () => { setDayDuration(dayDuration+1) }
  const onDaySpinnerDown = () => { if (dayDuration) setDayDuration(dayDuration-1) }
  const onHrsSpinnerUp   = () => { if (hourDuration < 24) setHourDuration(hourDuration+1) }
  const onHrsSpinnerDown = () => { if (hourDuration) setHourDuration(hourDuration-1) }
  const onMinSpinnerUp   = () => { if (minuteDuration < 60) setMinuteDuration(minuteDuration+1) }
  const onMinSpinnerDown = () => { if (minuteDuration) setMinuteDuration(minuteDuration-1) }
  //#endregion

  //#region Effects
  useEffect(() => {
    console.log("QAM Panel loaded")
    // Register listener
    Backend.eventBus.addEventListener('QueueProgress', onQueueProgress)
    Backend.eventBus.addEventListener('QueueCompletion', onQueueCompletion)
    Backend.eventBus.addEventListener('AppStateChange', onAppStateChange)
  }, [])
  useEffect(() => () => {
    Backend.eventBus.removeEventListener('QueueProgress', onQueueProgress)
    Backend.eventBus.removeEventListener('QueueCompletion', onQueueCompletion)
    Backend.eventBus.removeEventListener('AppStateChange', onAppStateChange)
    console.log("QAM Panel unloaded")
  }, [])
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
    if (appState == appStates.checkingForUpdates) {
      StatusText = "Checking for updates..."
    } else if (appState == appStates.processingQueue) {
      StatusText = "Processing queue..."
      if (queueProgress.currentItem && queueProgress.queueLength && queueProgress.queueProgress)
        StatusText = `(${queueProgress.queueProgress}/${queueProgress.queueLength}) ${queueProgress.currentItem.action} ${queueProgress.currentItem.packageRef}...`
      bgColor = "#7a0a0a"
    }
    return (
      <PanelSectionRow>
        <div style={{ backgroundColor: bgColor, color: "#FFFFFF", fontSize: "13px", overflow: "hidden", whiteSpace: "nowrap"}}>{StatusText}</div>
      </PanelSectionRow>
    )
  }
  //#endregion
  
  //#region Layout
  return (
    <PanelSection>
      {appState != appStates.idle ? <StatusBar /> : null}
      <PanelSectionRow>
        <Focusable style={{ display: "flex" }} flow-children="horizontal">
          <DialogButton style={FlatpakManagerButtons} onClick={onOpenFlatpakManager}><FaBoxOpen /></DialogButton>
          <DialogButton style={FlatpakManagerButtons} disabled={appState != appStates.idle} onSecondaryButton={onTestProcess} onClick={onCheckForUpdates}><FaRedoAlt /></DialogButton>
          <DialogButton style={FlatpakManagerButtons} disabled={appState != appStates.idle} onClick={onUpdateAllPackages}><FaDownload /></DialogButton>
        </Focusable>
      </PanelSectionRow>

      <div className={staticClasses.PanelSectionTitle}>Update Interval</div>
      <PanelSectionRow>
        <div style={{ display: "none" }}>{/* Fixes strange styling issue */}</div>
        <Spinner label="DAY" value={dayDuration} onClickUp={onDaySpinnerUp} onClickDown={onDaySpinnerDown} />
        <Spinner label="HRS" value={hourDuration} onClickUp={onHrsSpinnerUp} onClickDown={onHrsSpinnerDown} />
        <Spinner label="MIN" value={minuteDuration} onClickUp={onMinSpinnerUp} onClickDown={onMinSpinnerDown} />
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

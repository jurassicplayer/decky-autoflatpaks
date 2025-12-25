import { DialogButton, DialogControlsSection, DialogControlsSectionHeader, ToggleField } from "@decky/ui"
import { DefaultSettings, SettingKey, SettingsManager } from "../../../plugin/plugin.settings"
import { PluginSettings } from "../../../plugin/plugin.types"
import { useEffect, useMemo, useState } from "react"
import { logger } from "../../../plugin/backend"
import { ActionType, AppState, useAppContext } from "../../../plugin/context.v4"

export default function Content(){
  const {state, dispatch, reloadSources} = useAppContext("PluginSettingsPage")
  const { serviceConstructors, activeServices, debug, appState } = state
  const [enabledServices, setEnabledServices] = useState<Record<string, boolean>>({})
  const [debugFlag, setDebugFlag] = useState<boolean>(debug)
  const [userSettings, setUserSettings] = useState<Partial<PluginSettings>>(DefaultSettings)
  const [showToast, setShowToast] = useState<boolean>(DefaultSettings.showToast)
  const [playSound, setPlaySound] = useState<boolean>(DefaultSettings.playSound)
  const [checkOnBoot, setCheckOnBoot] = useState<boolean>(DefaultSettings.checkOnBoot)
  const [unattendedUpgrades, setUnattendedUpgrades] = useState<boolean>(DefaultSettings.unattendedUpgrades)
  const [processInterval, setProcessInterval] = useState<number>(DefaultSettings.processInterval)
  const [updateInterval, setUpdateInterval] = useState<number>(DefaultSettings.updateInterval)

  const onServiceChange = (serviceKey:string, value:boolean) => {
    setEnabledServices(prev => ({
      ...prev,
      [serviceKey]: value
    }))
  }
  const saveSettings = async ()=>{
    logger.debug("Saving plugin settings...")
    logger.debug("Enabled services: ", enabledServices)
    logger.debug("Current user settings: ", userSettings)
    let newSettings:Partial<PluginSettings> = {}
    if (showToast !== userSettings.showToast) newSettings.showToast = showToast
    if (playSound !== userSettings.playSound) newSettings.playSound = playSound
    if (checkOnBoot !== userSettings.checkOnBoot) newSettings.checkOnBoot = checkOnBoot
    if (unattendedUpgrades !== userSettings.unattendedUpgrades) newSettings.unattendedUpgrades = unattendedUpgrades
    if (processInterval !== userSettings.processInterval) newSettings.processInterval = processInterval
    if (updateInterval !== userSettings.updateInterval) newSettings.updateInterval = updateInterval
    if (debugFlag !== debug) dispatch({type: ActionType.SET_DEBUG, payload: debugFlag})

    let inactiveSources = Object.keys(serviceConstructors).filter(id => !enabledServices[id])
    let currentActiveServices = activeToEnabledServices()
    let enabledServicesChanged = Object.keys(serviceConstructors)
      .some(key => !!enabledServices[key] !== !!currentActiveServices[key])
    if (enabledServicesChanged) newSettings.inactiveSources = inactiveSources

    // Only save new settings if there are any to save
    if (Object.keys(newSettings).length === 0) return
    logger.debug("Pushing settings: ", newSettings)
    await SettingsManager.setSettings(newSettings)
    if (enabledServicesChanged) await reloadSources()
  }
  const onSave = async () => {
    if (appState != AppState.IDLE) {
      dispatch({type: ActionType.ADD_ERROR, payload: new Error('Application currently busy, please try again later.')})
      return
    }
    dispatch({type: ActionType.SET_APPSTATE, payload: AppState.BUSY})
    try {
      await saveSettings()
    } catch (error) {
      dispatch({type: ActionType.ADD_ERROR, payload: new Error('Save failed.')})
    } finally {
      dispatch({type: ActionType.SET_APPSTATE, payload: AppState.IDLE})
    }
  }

  const activeToEnabledServices = ():Record<string, boolean> => {
    let enabledServices:Record<string, boolean> = {}
    activeServices.forEach(service=>{ enabledServices[service.sourceKey] = true })
    return enabledServices
  }

  useEffect(()=>{
    logger.debug("views/Settings/Settings.tsx mounting...")
    setEnabledServices(activeToEnabledServices())
    SettingsManager.getSettings([
      SettingKey.showToast,
      SettingKey.playSound,
      SettingKey.checkOnBoot,
      SettingKey.unattendedUpgrades,
      SettingKey.processInterval,
      SettingKey.updateInterval
    ]).then((settings)=>{
      setUserSettings(settings)
      if(settings.showToast) setShowToast(settings.showToast)
      if(settings.playSound) setPlaySound(settings.playSound)
      if(settings.checkOnBoot) setCheckOnBoot(settings.checkOnBoot)
      if(settings.unattendedUpgrades) setUnattendedUpgrades(settings.unattendedUpgrades)
      if(settings.processInterval) setProcessInterval(settings.processInterval)
      if(settings.updateInterval) setUpdateInterval(settings.updateInterval)
    })
  },[])

  // Valid if something changed compared to original props.settings
  const valid = useMemo(
    () => {
      let currentActiveServices = activeToEnabledServices()
      let enabledServicesChanged = Object.keys(serviceConstructors).some(key => !!enabledServices[key] !== !!currentActiveServices[key])
      return (
        showToast !== userSettings.showToast ||
        playSound !== userSettings.playSound ||
        checkOnBoot !== userSettings.checkOnBoot ||
        unattendedUpgrades !== userSettings.unattendedUpgrades ||
        processInterval !== userSettings.processInterval ||
        updateInterval !== userSettings.updateInterval ||
        debugFlag !== debug ||
        enabledServicesChanged
      )
    },
    [
      enabledServices, showToast, playSound, checkOnBoot, unattendedUpgrades, processInterval, updateInterval, debug,
      activeServices, userSettings.showToast, userSettings.playSound, userSettings.checkOnBoot, userSettings.unattendedUpgrades, userSettings.processInterval, userSettings.updateInterval, debugFlag
    ]
  )
  return (
    <>
      <DialogControlsSection>
        <DialogButton disabled={!valid || appState === AppState.BUSY} onClick={onSave}>Apply</DialogButton>
        <DialogControlsSectionHeader>Enabled Services</DialogControlsSectionHeader>
        {Object.keys(serviceConstructors).map((sourceKey)=> {
          let SourceIcon = serviceConstructors[sourceKey].sourceIcon
          return (
            <ToggleField
              key={sourceKey}
              checked={!!enabledServices[sourceKey]}
              disabled={appState === AppState.BUSY}
              icon={<SourceIcon/>}
              bottomSeparator="none"
              indentLevel={1}
              label={serviceConstructors[sourceKey].sourceDisplayName}
              onChange={(value)=>{onServiceChange(sourceKey, value)}}
            />
          )
        })}
      </DialogControlsSection>
      <DialogControlsSection>
        <DialogControlsSectionHeader>Plugin</DialogControlsSectionHeader>
        <ToggleField
          checked={checkOnBoot}
          disabled={appState === AppState.BUSY}
          indentLevel={1}
          label="Check for Updates on Boot"
          onChange={setCheckOnBoot}
        />
        <ToggleField
          checked={unattendedUpgrades}
          disabled={appState === AppState.BUSY}
          indentLevel={1}
          label="Unattended Upgrades"
          description="Automatically update packages when updates are available"
          onChange={setUnattendedUpgrades}
        />
      </DialogControlsSection>
      <DialogControlsSection>
        <DialogControlsSectionHeader>Notifications</DialogControlsSectionHeader>
        <ToggleField
          checked={showToast}
          disabled={appState === AppState.BUSY}
          indentLevel={1}
          label="Show Toast Notifications"
          onChange={setShowToast}
        />
        <ToggleField
          checked={playSound}
          disabled={appState === AppState.BUSY}
          indentLevel={1}
          label="Play Notification Sound"
          onChange={setPlaySound}
        />
      </DialogControlsSection>
      <DialogControlsSection>
        <DialogControlsSectionHeader>Other</DialogControlsSectionHeader>
        <ToggleField
          checked={debugFlag}
          indentLevel={1}
          label="Enable Debug Mode"
          onChange={setDebugFlag}
        />
      </DialogControlsSection>
    </>
  )
}
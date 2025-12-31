import { DialogBody, DialogButton, DialogControlsSection, DialogSubHeader, Focusable, SliderField, ToggleField } from "@decky/ui"
import { DayHourMinuteSpinner, DialogBodyText } from "../../../common/custom-components"
import { DefaultSettings, SettingKey, SettingsManager } from "../../../plugin/plugin.settings"
import { PluginSettings } from "../../../plugin/plugin"
import { useEffect, useMemo, useState } from "react"
import { logger } from "../../../plugin/backend"
import { ActionType, AppState, useAppContext } from "../../../plugin/app.context"
import { useTranslation } from "react-i18next"
import { PackageServices } from "../../../services"


/*
##TODO: Extend showToast/playSound functionality
  - ##TODO: Add an array of notification types (like steamclient's separate toggles for each notification type)
  - Toggling showToast/playSound will enable/disable all notification types
  - Drop playSound config option entirely and just read the SteamOS configuration instead?
    - If the SteamOS configuration to play sound is disabled, all of the decky toasts won't be able to play sounds anyways
    - ##TODO: Could keep config option and still read SteamOS configuration/show proper toggled states
##TODO: Add showInBell functionality
  - SteamClient has a way of not including toasts in the QAM's Bell Notifications, no idea how atm since
    decky-loader's default always sends to the Bell Notifications
  - ##TODO: Could do the janky way of sending a toast with an expiration=1 and showNewIndicator=false
  - ##TODO:? Add debug option to set ToastData expiration?
*/
export default function Content(){
  const { t } = useTranslation()
  const {state, dispatch, reloadSources} = useAppContext("PluginSettingsPage")
  const { activeServices, appState } = state
  const [enabledServices, setEnabledServices] = useState<Record<string, boolean>>({})
  const [userSettings, setUserSettings] = useState<Partial<PluginSettings>>(DefaultSettings)
  const [debug, setDebug] = useState<boolean>(DefaultSettings.debug)
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
  const loadSettings = async ()=>{
    let settings = await SettingsManager.getSettings([
      SettingKey.debug,
      SettingKey.showToast,
      SettingKey.playSound,
      SettingKey.checkOnBoot,
      SettingKey.unattendedUpgrades,
      SettingKey.processInterval,
      SettingKey.updateInterval
    ])
    setUserSettings(settings)
    if(settings.debug) setDebug(settings.debug)
    if(settings.showToast) setShowToast(settings.showToast)
    if(settings.playSound) setPlaySound(settings.playSound)
    if(settings.checkOnBoot) setCheckOnBoot(settings.checkOnBoot)
    if(settings.unattendedUpgrades) setUnattendedUpgrades(settings.unattendedUpgrades)
    if(settings.processInterval) setProcessInterval(settings.processInterval)
    if(settings.updateInterval) setUpdateInterval(settings.updateInterval)
  }
  const saveSettings = async ()=>{
    logger.debug("Saving plugin settings...")
    logger.debug("Enabled services: ", enabledServices)
    logger.debug("Current user settings: ", userSettings)
    let newSettings:Partial<PluginSettings> = {}
    if (debug !== userSettings.debug) {
      newSettings.debug = debug
      dispatch({type: ActionType.SET_DEBUGMODE, payload: debug})
    }
    if (showToast !== userSettings.showToast) newSettings.showToast = showToast
    if (playSound !== userSettings.playSound) newSettings.playSound = playSound
    if (checkOnBoot !== userSettings.checkOnBoot) newSettings.checkOnBoot = checkOnBoot
    if (unattendedUpgrades !== userSettings.unattendedUpgrades) newSettings.unattendedUpgrades = unattendedUpgrades
    if (processInterval !== userSettings.processInterval) newSettings.processInterval = processInterval
    if (updateInterval !== userSettings.updateInterval) newSettings.updateInterval = updateInterval

    let inactiveSources = Object.keys(PackageServices).filter(id => !enabledServices[id])
    let currentActiveServices = activeToEnabledServices()
    let enabledServicesChanged = Object.keys(PackageServices)
      .some(key => !!enabledServices[key] !== !!currentActiveServices[key])
    if (enabledServicesChanged) newSettings.inactiveSources = inactiveSources

    // Only save new settings if there are any to save
    if (Object.keys(newSettings).length === 0) return
    logger.debug("Pushing settings: ", newSettings)
    await SettingsManager.setSettings(newSettings)
    // Reload settings to refresh validity check
    await loadSettings()
    if (enabledServicesChanged) await reloadSources()
  }
  const onSave = async () => {
    if (appState != AppState.IDLE) {
      dispatch({type: ActionType.ADD_ERROR, payload: new Error(t('error:applicationBusy'))})
      return
    }
    dispatch({type: ActionType.SET_APPSTATE, payload: AppState.BUSY})
    try {
      await saveSettings()
    } catch (error) {
      dispatch({type: ActionType.ADD_ERROR, payload: new Error(t('error:failedToSave'))})
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
    loadSettings()
  },[])

  // Valid if something changed compared to current user settings
  const valid = useMemo(
    () => {
      let currentActiveServices = activeToEnabledServices()
      let enabledServicesChanged = Object.keys(PackageServices).some(key => !!enabledServices[key] !== !!currentActiveServices[key])
      return (
        debug !== userSettings.debug ||
        showToast !== userSettings.showToast ||
        playSound !== userSettings.playSound ||
        checkOnBoot !== userSettings.checkOnBoot ||
        unattendedUpgrades !== userSettings.unattendedUpgrades ||
        processInterval !== userSettings.processInterval ||
        updateInterval !== userSettings.updateInterval ||
        enabledServicesChanged
      )
    },
    [
      enabledServices, debug, showToast, playSound, checkOnBoot, unattendedUpgrades, processInterval, updateInterval,
      activeServices, userSettings.debug, userSettings.showToast, userSettings.playSound, userSettings.checkOnBoot, userSettings.unattendedUpgrades, userSettings.processInterval, userSettings.updateInterval,
    ]
  )
  return (
    <Focusable
      onSecondaryActionDescription={valid?t('common:button.apply'):null}
      onSecondaryButton={valid&&appState===AppState.IDLE?onSave:()=>null}
      >
      <DialogBody>
        <DialogControlsSection>
          <DialogButton disabled={!valid || appState === AppState.BUSY} onClick={onSave}>{t('common:button.apply')}</DialogButton>
          <DialogSubHeader>{t('settings:enabledServices.subheader')}</DialogSubHeader>
          <DialogBodyText>{t('settings:enabledServices.dialogbodytext')}</DialogBodyText>
          {Object.keys(PackageServices).map((sourceKey)=> {
            let SourceIcon = PackageServices[sourceKey].sourceIcon
            return (
              <ToggleField
                key={sourceKey}
                checked={!!enabledServices[sourceKey]}
                disabled={appState === AppState.BUSY}
                icon={<SourceIcon/>}
                bottomSeparator="none"
                indentLevel={1}
                label={PackageServices[sourceKey].sourceDisplayName}
                onChange={(value)=>{onServiceChange(sourceKey, value)}}
              />
            )
          })}
        </DialogControlsSection>
        <DialogControlsSection>
          <DialogSubHeader>{t('settings:plugin.subheader')}</DialogSubHeader>
          <ToggleField
            checked={checkOnBoot}
            disabled={appState === AppState.BUSY}
            indentLevel={1}
            label={t('settings:plugin.checkOnBoot.label')}
            onChange={setCheckOnBoot}
          />
          <ToggleField
            checked={unattendedUpgrades}
            disabled={appState === AppState.BUSY}
            indentLevel={1}
            label={t('settings:plugin.unattendedUpgrades.label')}
            description={t('settings:plugin.unattendedUpgrades.description')}
            onChange={setUnattendedUpgrades}
          />
          <DayHourMinuteSpinner
            label="Update Interval"
            description="Regular interval to perform automatic checks for updates."
            value={updateInterval}
            onChange={setUpdateInterval}
            indentLevel={1}
          />
        </DialogControlsSection>
        <DialogControlsSection>
          <DialogSubHeader>{t('settings:notifications.subheader')}</DialogSubHeader>
          <DialogBodyText>{t('settings:notifications.dialogbodytext')}</DialogBodyText>
          <ToggleField
            checked={showToast}
            disabled={appState === AppState.BUSY}
            indentLevel={1}
            label={t('settings:plugin.showToast.label')}
            onChange={setShowToast}
          />
          <ToggleField
            checked={playSound}
            disabled={appState === AppState.BUSY}
            indentLevel={1}
            label={t('settings:plugin.playSound.label')}
            onChange={setPlaySound}
          />
        </DialogControlsSection>
        <DialogControlsSection>
          <DialogSubHeader>{t('settings:other.subheader')}</DialogSubHeader>
          <ToggleField
            checked={debug}
            indentLevel={1}
            label={t('settings:plugin.developerMode.label')}
            onChange={setDebug}
          />
          {debug?
            <SliderField
              value={processInterval}
              min={1}
              max={30}
              showValue={true}
              editableValue={true}
              notchTicksVisible={true}
              indentLevel={1}
              label={t('settings:plugin.processInterval.label')}
              description={t('settings:plugin.processInterval.description')}
              onChange={setProcessInterval}
            />
          :null}
        </DialogControlsSection>
      </DialogBody>
    </Focusable>
  )
}
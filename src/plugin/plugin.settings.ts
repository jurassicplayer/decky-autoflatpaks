import { PluginSettings } from "./plugin"
import { loadSettings, saveSettings, getSettings, setSettings, logger } from "./backend"

export enum SettingKey {
  version = "version",
  debug = "debug",
  showToast = "showToast",
  playSound = "playSound",
  checkOnBoot = "checkOnBoot",
  unattendedUpgrades = "unattendedUpgrades",
  processInterval = "processInterval",
  updateInterval = "updateInterval",
  inactiveSources = "inactiveSources"
}

export const DefaultSettings:PluginSettings = {
  version: 2,
  debug: false,
  showToast: false,
  playSound: false,
  checkOnBoot: false,
  unattendedUpgrades: false,
  processInterval: 5,
  updateInterval: 720,
  inactiveSources: []
}

export class SettingsManager {
  // Call to reload settings from disk
  static async loadSettings(): Promise<void> {
    //let jsonData = await loadSettings()
    return loadSettings()
  }
  // Call to save settings to disk
  static async saveSettings(): Promise<void> {
    return saveSettings()
  }
  static async getSettings(keys: (keyof PluginSettings)[], overrides?: Partial<PluginSettings>): Promise<Partial<PluginSettings>> {
    logger.debug("Getting settings: ", keys)
    let defaults:Partial<PluginSettings> = {}
    keys.forEach(key => {
      defaults[key] = DefaultSettings[key]
      if (overrides && overrides[key] !== undefined){
        defaults[key] = overrides[key]
      }
    })
    let jsonData = await getSettings(JSON.stringify(defaults))
    logger.debug("Retrieved settings: ", jsonData)
    return JSON.parse(jsonData)
  }
  static async setSettings(settings: Partial<PluginSettings>): Promise<void> {
    return setSettings(JSON.stringify(settings))
  }
}
import { SettingsManager } from "../plugin/plugin.settings"

export class SettingsManagerTests {
  static async GetSingleSettingKey(){
    let loadedSettings = await SettingsManager.loadSettings()
    console.log("Loaded all settings: ", loadedSettings)
    let currentKey = ""
    try {
      let settingKeys = ["version", "flatpak", "github", "custom_url"]
      for (const key of settingKeys) {
        currentKey = key
        let settings = await SettingsManager.getSettings([key])
        console.log(`Settingkey [${key}]: `, settings)
      }
    } catch {
      console.log(`Failed to get key: ${currentKey}`)
    }
  }
}
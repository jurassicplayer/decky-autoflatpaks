import { Backend } from './Backend'

export class Settings {
  public static showToast:                  boolean = true
  public static playSound:                  boolean = true
  public static checkOnBootEnabled:         boolean = true
  public static unattendedUpgradesEnabled:  boolean = false
  public static updateInterval:             number = 720
  public static lastCheckTimestamp:         Date = new Date()

  static async loadFromLocalStorage() {
    var returncode = true
    let settings = '[AutoFlatpaks] Loaded settings from storage'
    for (let key in this) {
      try {
        if (typeof this[key] == "boolean") this[key] = (await Backend.getSetting(key, this[key])) as boolean
        else if (typeof this[key] == "number") this[key] = (await Backend.getSetting(key, this[key])) as number
        else if (typeof this[key] == "string") this[key] = (await Backend.getSetting(key, this[key])) as string
        else if (this[key] instanceof Date) this[key] = new Date((await Backend.getSetting(key, this[key])).toString())
        settings += `\n\t${key}: ${this[key]}`
      } catch (error) {
        returncode = false
        console.debug('[AutoFlatpaks] Failed to load setting: ', key)
      }
    }
    console.debug(settings)
    return returncode
  }

  static async saveToLocalStorage() {
    let promises = Object.keys(this).map(key => {
      return Backend.setSetting(key, this[key])
    })
    Promise.all(promises).then(async () => {
      await Backend.commitSettings()
    })
  }

  static async saveLastCheckTimestamp() {
    await Backend.setSetting('lastCheckTimestamp', this.lastCheckTimestamp)
    await Backend.commitSettings()
  }
}
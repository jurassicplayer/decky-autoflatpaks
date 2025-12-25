export type PluginSettings = {
  version: number
  showToast: boolean
  playSound: boolean
  checkOnBoot: boolean
  unattendedUpgrades: boolean
  processInterval: number
  updateInterval: number
  inactiveSources: string[]
  [key: string]: any
}
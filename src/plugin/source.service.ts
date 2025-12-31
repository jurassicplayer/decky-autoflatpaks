import { FC } from "react"
import { SettingsManager } from "./plugin.settings"
import { PluginSettings } from "./plugin"
import { logger } from "./backend"

//#region types
// This is the source settings type, sources should extend this type and provide the extended type to the functions
export type SourceSettings = {
  version: number
}

// This is the source package type, sources should extend this type and provide the extended type to the functions
export type SourcePackage = {
  id: string
  name: string
  shortDescription: string
}

export type PackageDetailsProps<PackageType> = {
  pkg: PackageType
}

export type PackageListItemProps<PackageType> = {
  pkg: PackageType
}

// A generic constructor type for any SourceService subclass
export type SourceServiceCtor<SettingsType extends SourceSettings, PackageType extends SourcePackage> = {
  sourceKey: string
  sourceDisplayName: string
  sourceIcon: FC
  defaultSettings: SettingsType
  new (): SourceService<SettingsType, PackageType>
}
//#endregion

export abstract class SourceService<SettingsType extends SourceSettings, PackageType extends SourcePackage> {
  //#region Properties
  protected abstract _settings: SettingsType
  readonly sourceKey: string
  readonly sourceDisplayName: string
  readonly sourceIcon: FC
  readonly defaultSettings: SettingsType
  //#endregion

  //#region Constructor
  protected constructor(sourceKey:string, sourceDisplayName:string, sourceIcon:FC, defaultSettings:SettingsType){
    // Inherit implementation's static properties for base functions
    this.sourceKey = sourceKey
    this.sourceDisplayName = sourceDisplayName // Might not need to inherit
    this.sourceIcon = sourceIcon // Might not need to inherit
    this.defaultSettings = defaultSettings
  }
  //#endregion

  //#region Base Functions
  async loadSettings():Promise<void> {
    if (this.sourceKey === undefined) return
    logger.debug("Loading settings for: ", this.sourceKey)
    let defaults:{[key:string]: any} = {}
    defaults[this.sourceKey] = this.defaultSettings
    let sourceSettings = await SettingsManager.getSettings([this.sourceKey], defaults)
    this._settings = sourceSettings[this.sourceKey] as SettingsType
  }
  async getSettings(keys: (keyof SettingsType)[]): Promise<Partial<SettingsType>> {
    let res:Partial<SettingsType> = {}
    keys.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(this._settings, key) && this._settings[key] !== undefined) {
        res[key] = this._settings[key]
      } else {
        res[key] = this.defaultSettings[key]
      }
    })
    return res
  }
  async setSettings(settings: Partial<SettingsType>): Promise<void> {
    this._settings = {...this._settings, ...settings}
    let new_settings:Partial<PluginSettings> = {}
    new_settings[this.sourceKey] = this._settings
    return await SettingsManager.setSettings(new_settings)
  }
  //#region Addon Service Management
  _onMigrate():Error[] { return [] }
  _onLoad():Error[] { return [] }
  _onUnload():Error[] { return [] }
  //#endregion
  //#endregion

  //#region Abstract Functions
  //#region Package Management
  abstract getPackages(args?: any): Promise<PackageType[]|Error[]>
  abstract installPackages(pkgs: Partial<PackageType>, args?: any): Promise<Error[]>
  abstract removePackages(pkgs: Partial<PackageType>, args?: any): Promise<Error[]>
  abstract updatePackages(pkgs: Partial<PackageType>, args?: any): Promise<Error[]>
  abstract freezePackages(pkgs: Partial<PackageType>, args?: any): Promise<Error[]>
  //#endregion

  //#region Components
  abstract packageDetails(pkg: Partial<PackageType>): FC
  abstract packageListItem(pkg: Partial<PackageType>): FC
  // Source Pages
  sourceSources?():FC
  sourceConfiguration?():FC
  sourceMaintenance?():FC
  sourceHelpGuide?():FC
  //#endregion
  //#endregion
}



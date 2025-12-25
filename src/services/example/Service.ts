import { FC } from "react"
import { FaGithub } from "react-icons/fa"
import { logger } from "../../plugin/backend"
import { SourcePackage, SourceService, SourceSettings } from "../../plugin/source.service"
import { ConfigurationComponent, ConfigurationComponentProps } from "./SourceConfiguration"

export type SettingsType = SourceSettings & {
  cooked: boolean
  recipe: string
}

export type PackageType = SourcePackage & {
  isInstalled: boolean
  isUpgradeable: boolean
}

export const DefaultSettings:SettingsType = {
  version: 1,
  cooked: true,
  recipe: "just add water"
}

export class PackageService extends SourceService<SettingsType, PackageType> {
  static readonly sourceKey:string = "example"
  static readonly sourceDisplayName:string = "Example"
  static readonly sourceIcon:FC = FaGithub
  static readonly defaultSettings:SettingsType = DefaultSettings
  _settings:SettingsType = {...PackageService.defaultSettings}

  constructor(){
    super(PackageService.sourceKey, PackageService.sourceDisplayName, PackageService.sourceIcon, PackageService.defaultSettings)
    logger.debug("Constructing class instance of service: ", PackageService.sourceKey)
    logger.debug("Class instance settings: ", this._settings)
  }
  _onMigrate(): Error[] { logger.debug("On example service migrate"); return [] }
  _onLoad(): Error[] { logger.debug("On example service load"); return [] }
  _onUnload(): Error[] { logger.debug("On example service unload"); return [] }
  getPackages(args: any): Promise<PackageType[] | Error[]> {
    throw new Error("Method not implemented.")
  }
  installPackages(pkgs: Partial<PackageType>, args: any): Promise<Error[]> {
    throw new Error("Method not implemented.")
  }
  removePackages(pkgs: Partial<PackageType>, args: any): Promise<Error[]> {
    throw new Error("Method not implemented.")
  }
  updatePackages(pkgs: Partial<PackageType>, args: any): Promise<Error[]> {
    throw new Error("Method not implemented.")
  }
  freezePackages(pkgs: Partial<PackageType>, args: any): Promise<Error[]> {
    throw new Error("Method not implemented.")
  }
  packageDetails(pkg: Partial<PackageType>): FC {
    throw new Error("Method not implemented.")
  }
  packageListItem(pkg: Partial<PackageType>): FC {
    throw new Error("Method not implemented.")
  }
  sourceConfiguration(): FC {
    logger.debug("Creating source configuration component: ", this)
    let props:ConfigurationComponentProps = {
      parentClass: this,
      settings: this._settings,
      getSettings: this.getSettings,
      setSettings: this.setSettings
    }
    return () => ConfigurationComponent(props)
  }
}

export default PackageService
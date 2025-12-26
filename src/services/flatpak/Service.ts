import { FC } from "react"
import { FaGithub } from "react-icons/fa"
import { logger } from "../../plugin/backend"
import { SourcePackage, SourceService, SourceSettings } from "../../plugin/source.service"
import { ConfigurationComponent, ConfigurationComponentProps } from "./Configuration"

export type SettingsType = SourceSettings & {
  aggressiveFilterEnabled: boolean
  environmentVariableEnabled: boolean
  environmentVariables: {[key:string]: string}
}

export type PackageType = SourcePackage & {
  version: string
  isInstalled: boolean
  isUpgradeable: boolean
}

export const DefaultSettings:SettingsType = {
  version: 1,
  aggressiveFilterEnabled: false,
  environmentVariableEnabled: false,
  environmentVariables: {"http_proxy": "http://www.google.com"}
}

export class PackageService extends SourceService<SettingsType, PackageType> {
  static readonly sourceKey:string = "flatpak"
  static readonly sourceDisplayName:string = "Flatpak"
  static readonly sourceIcon:FC = FaGithub
  static readonly defaultSettings:SettingsType = DefaultSettings
  _settings:SettingsType = {...this.defaultSettings}

  constructor(){
    super(PackageService.sourceKey, PackageService.sourceDisplayName, PackageService.sourceIcon, PackageService.defaultSettings)
    logger.debug("Constructing class instance of service: ", this.sourceKey)
    logger.debug("Class instance settings: ", this._settings)
  }
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
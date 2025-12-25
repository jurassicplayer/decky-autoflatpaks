import { createContext, FC, ReactNode, useContext, useMemo, useState } from "react"
import { SourceService, SourceServiceCtor } from "./source.service"
import { getAppInfo, logger } from "./backend"
import { SettingsManager, SettingKey } from "./plugin.settings"
import { PackageServices } from "../services"

/*
##FIXME##
Rewrite all of context?
Use useReducer to manipulate application state and allow for using the `dispatch` method to update the state and cause a re-render
- activeServices
- errorLog
- debug
- appInfo
Create a wrapper higher-order-component to wrap components into context
*/


export interface ProviderProps { children: ReactNode, appContextState: AppContextState }
export interface IAppContext {
  serviceConstructors:Record<string, SourceServiceCtor<any, any>>
  activeServices:SourceService<any, any>[]
  errorLog:Error[]
  debug:boolean
  appName:string
  appVersion:string
  onMount(): Promise<void>
  onDismount(): void
  reloadSources(): Promise<void>
  contextWrapper(Component:FC): FC
  onTest(): void
}

export class AppContextState implements IAppContext {
  serviceConstructors:Record<string,SourceServiceCtor<any, any>> = PackageServices
  activeServices:SourceService<any, any>[] = []
  errorLog:Error[] = []
  debug:boolean = true
  appName:string = ""
  appVersion:string = "0.0.0"
  async onMount(){
    logger.debug("Mounting plugin")
    const {appName, appVersion} = await getAppInfo()
    this.appName = appName
    this.appVersion = appVersion
    await this.reloadSources()

    logger.debug("Handle plugin CheckOnBoot/UnattendedUpgrades...")
    const {checkOnBoot, unattendedUpgrades} = await SettingsManager.getSettings([SettingKey.checkOnBoot, SettingKey.unattendedUpgrades])
    if (!checkOnBoot) { return }
    // Check for updates
    // var commandret:boolean = await call flatpak update and not update
    // if (!commandret) { return } // Check stderr for data. If no data, assume that the command didn't fail (calling flatpak update and then not updating returns 1)
    if (!unattendedUpgrades) { return }
    // Unattended updates
    // await call flatpak update and update
  }

  onDismount(){
    logger.debug("Dismounting plugin")
  }

  async reloadSources() {
    logger.debug("Reloading addon services...")
    this.activeServices = []
    const { inactiveSources } = await SettingsManager.getSettings([SettingKey.inactiveSources])
    for (const PackageServiceKey in this.serviceConstructors) {
      if (inactiveSources?.includes(PackageServiceKey)) { 
        logger.debug("Service marked as inactive, skipping: ", PackageServiceKey)
        continue
      }
      const serviceInstance = new this.serviceConstructors[PackageServiceKey]()
      await serviceInstance.loadSettings()
      this.activeServices.push(serviceInstance)
    }
  }

  contextWrapper(Component:FC): FC{
    logger.debug("Wrapping component into app context")
    return ()=><AppContextProvider appContextState={this}><Component /></AppContextProvider>
  }

  async onTest(){
    for (const service of this.activeServices) {
      const keys = Object.keys(service.defaultSettings) as (keyof typeof service.defaultSettings)[]
      const settings = await service.getSettings(keys)
      logger.debug(`${service.sourceKey} settings:`, settings)
    }
  }
}

const AppContext = createContext<IAppContext>(null as any)
export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {throw new Error("useAppContext must be used within AppContextProvider")}
  return context
}

export const AppContextProvider:FC<ProviderProps> = ({children, appContextState}) => {
  const [appCtx, _] = useState<IAppContext>(appContextState)
  const [activeServices, setActiveServices] = useState<SourceService<any,any>[]>(appContextState.activeServices)
  const [debug, setDebug] = useState<boolean>(appContextState.debug)
  const [errorLog, setErrorLog] = useState<Error[]>(appContextState.errorLog)
  //const [appCtx, _] = useState<IAppContext>(appContextState)
  const reloadSources = async () => {
    await appContextState.reloadSources()
    setActiveServices(appContextState.activeServices)
  }
  const contextWrapper = appContextState.contextWrapper
  const onMount = appContextState.onMount
  const onDismount = appContextState.onDismount
  const onTest = appContextState.onTest
  let context = useMemo<IAppContext>(()=>appCtx, [appCtx.activeServices, appCtx.debug, appCtx.errorLog])
  return (
    <AppContext.Provider value={context}>
      {useMemo(() => children, [])}
    </AppContext.Provider>
  )
}
import { ComponentType, createContext, FC, ReactNode, useContext, useEffect, useState } from "react"
import { routerHook } from "@decky/api"
import { PackageServices } from "../services"
import { getAppInfo, logger } from "./backend"
import { SettingKey, SettingsManager } from "./plugin.settings"
import { ContextState, AppAction, ActionType, AppState, AppContext } from "./app.context.types"

// // For autocomplete
// export enum ActionType {
//   SET_APPINFO = 'SET_APPINFO',
//   SET_APPSTATE = 'SET_APPSTATE',
//   SET_DEBUG = 'SET_DEBUG',
//   SET_ERRORLOG = 'SET_ERRORLOG',
//   SET_SERVICES = 'SET_SERVICES',
//   ADD_ERROR = 'ADD_ERROR'
// }
// // For autocomplete
// export enum AppState {
//   IDLE = 'IDLE',
//   BUSY = 'BUSY',
//   FAIL = 'FAIL'
// }

// export type AppAction =
//   | { type: ActionType.SET_APPINFO; payload: { appName: string; appVersion: string } }
//   | { type: ActionType.SET_APPSTATE; payload: AppState }
//   | { type: ActionType.SET_DEBUG; payload: boolean }
//   | { type: ActionType.SET_ERRORLOG; payload: Error[] }
//   | { type: ActionType.SET_SERVICES; payload: SourceService<any, any>[] }
//   | { type: ActionType.ADD_ERROR; payload: Error }

// export interface ContextState {
//   serviceConstructors:Record<string, SourceServiceCtor<any, any>>
//   activeServices:SourceService<any, any>[]
//   errorLog:Error[]
//   debug:boolean
//   appName:string
//   appVersion:string
//   appState:AppState
// }

export const initialState:ContextState = {
  serviceConstructors: PackageServices,
  activeServices: [],
  errorLog: [],
  debugMode: false,
  appName: "AutoFlatpaks",
  appVersion: "0.0.0",
  appState: AppState.BUSY
}

// export interface AppContext {
//   state: ContextState
//   dispatch: Dispatch<AppAction>
//   subscribe(origin:string, listener: ()=>void): ()=>void 
//   onMount(): Promise<void>
//   onDismount(): void
//   reloadSources(): Promise<void>
//   onTest(): void
// }

const AppContext = createContext<AppContext|null>(null)
export const useAppContext = (origin:string) => {
  const context = useContext(AppContext)
  if (!context) {throw new Error("useAppContext must be used within AppContextProvider")}
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    const unsubscribe = context.subscribe(origin,() => forceUpdate(x => x+1))
    return unsubscribe
  }, [context])
  return context
}

export class PluginService implements AppContext {
  state:ContextState = initialState
  private constructor() {
    logger.debug("Creating PluginService instance...")
  }
  // #region Singleton shared context handling
  private static _instance: PluginService
  private listeners = new Set<{origin:string, callback:()=>void}>()
  static getInstance = ():AppContext => {
    if (!PluginService._instance) { PluginService._instance = new PluginService() }
    return PluginService._instance
  }
  public subscribe(origin:string, listener: ()=>void) {
    const listenerObject = {origin:origin, callback:listener}
    this.listeners.add(listenerObject)
    logger.debug(`Context subscription from ${origin}, total subscribers: ${this.listeners.size}`)
    return ()=>{
      this.listeners.delete(listenerObject)
      logger.debug(`Unsubscribed ${origin} total subscribers: ${this.listeners.size}`)
    }
  }
  public dispatch = (action:AppAction):ContextState => {
    this.state = this.reducer(this.state, action)
    logger.debug(`Dispatch action: ${JSON.stringify(action)}`)
    this.notify()
    return this.state
  }
  private notify() { for (const listener of this.listeners){
    logger.debug(`Firing notification for ${listener.origin}`)
    listener.callback()}
  }
  private reducer(state:ContextState, action:AppAction):ContextState {
    switch (action.type) {
      case ActionType.SET_APPINFO: return {...state, appName: action.payload.appName, appVersion: action.payload.appVersion}
      case ActionType.SET_APPSTATE: return {...state, appState: action.payload}
      case ActionType.SET_DEBUG: return {...state, debugMode: action.payload}
      case ActionType.SET_ERRORLOG: return {...state, errorLog: action.payload}
      case ActionType.ADD_ERROR: return {...state, errorLog: [...state.errorLog, action.payload]}
      case ActionType.SET_SERVICES:
        const servicesToUnload = state.activeServices.filter(prevService => !action.payload.some(
          currentService => currentService.sourceKey === prevService.sourceKey
        ))
        for (const service of servicesToUnload) { service._onUnload() }
        return {...state, activeServices: action.payload}
      default: return state
    }
  }
  // #endregion

  onMount = async () => {
    logger.debug("Mounting plugin")
    const {appName, appVersion} = await getAppInfo()
    this.dispatch({type: ActionType.SET_APPINFO, payload: {appName, appVersion}})
    const {debug, checkOnBoot, unattendedUpgrades} = await SettingsManager.getSettings([SettingKey.debug, SettingKey.checkOnBoot, SettingKey.unattendedUpgrades])
    this.dispatch({type: ActionType.SET_DEBUG, payload: debug ?? initialState.debugMode})
    await this.reloadSources()
    logger.debug("Handle plugin CheckOnBoot/UnattendedUpgrades...")
    if (checkOnBoot) {
      // Check for updates
      // var commandret:boolean = await call flatpak update and not update
      // if (!commandret) { return } // Check stderr for data. If no data, assume that the command didn't fail (calling flatpak update and then not updating returns 1)
      if (!unattendedUpgrades) {
        // Unattended updates
        // await call flatpak update and update
      }
    }
    this.dispatch({type: ActionType.SET_APPSTATE, payload: AppState.IDLE})
  }
  onDismount = () => {
    logger.debug("Dismounting plugin")
    routerHook.removeRoute("/autoflatpaks/manager")
  }
  reloadSources = async () => {
    logger.debug("Reloading addon services...")
    let activeServices = []
    const { inactiveSources } = await SettingsManager.getSettings([SettingKey.inactiveSources])
    for (const PackageServiceKey in this.state.serviceConstructors) {
      if (inactiveSources?.includes(PackageServiceKey)) { 
        logger.debug("Service marked as inactive, skipping: ", PackageServiceKey)
        continue
      }
      const serviceInstance = new this.state.serviceConstructors[PackageServiceKey]()
      try {
        await serviceInstance._onMigrate()
        await serviceInstance.loadSettings()
        await serviceInstance._onLoad()
      } catch (error) {
        this.dispatch({type: ActionType.ADD_ERROR, payload: error instanceof Error ? error : new Error('Unknown error while loading source')})
      }
      activeServices.push(serviceInstance)
    }
    this.dispatch({type: ActionType.SET_SERVICES, payload: activeServices})
  }
  onTest = () => {}
}

export const AppContextProvider:FC<{children:ReactNode}> = ({children}) => {
  return (
    <AppContext.Provider value={PluginService.getInstance()}>
      {children}
    </AppContext.Provider>
  )
}

export const withAppContext = <P extends object>(WrappedComponent:ComponentType<P>):FC<P> => {
  return (props: P) => {
    return (
      <AppContextProvider><WrappedComponent {...props} /></AppContextProvider>
    )
  }
}
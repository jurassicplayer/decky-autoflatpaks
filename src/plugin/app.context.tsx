import { createContext, Dispatch, FC, ReactNode, useContext, useEffect, useState } from "react"
import { routerHook } from "@decky/api"
import { PackageServices } from "../services"
import { getAppInfo, logger } from "./backend"
import { DefaultSettings, SettingKey, SettingsManager } from "./plugin.settings"
import { SourceService } from "./source.service"
import { getLocalStorage, setLocalStorage, StorageKey } from "../common/utils"

//#region Enums/Interfaces/Types
//#region Enums
export enum ActionType {
  SET_APPSTATE = 'SET_APPSTATE',
  SET_DEBUGMODE = 'SET_DEBUGMODE',
  SET_LASTCHECKTIMESTAMP = 'SET_LASTCHECKTIMESTAMP',
  SET_ERRORLOG = 'SET_ERRORLOG',
  SET_SERVICES = 'SET_SERVICES',
  ADD_ERROR = 'ADD_ERROR',
}
export enum AppState {
  IDLE = 'IDLE',
  BUSY = 'BUSY',
  FAIL = 'FAIL'
}
export enum HookType {
  ON_RESUME = 'ON_RESUME',
  ON_SHUTDOWN = 'ON_SHUTDOWN',
  ON_SUSPEND = 'ON_SUSPEND',
}
//#endregion

//#region Types
export type Hook = {
  type:HookType
  unregister?:CallableFunction
}
export type UIAction =
  | { type: ActionType.SET_APPSTATE; payload: AppState }
  | { type: ActionType.SET_DEBUGMODE; payload: boolean }
  | { type: ActionType.SET_LASTCHECKTIMESTAMP; payload: Date }
  | { type: ActionType.SET_ERRORLOG; payload: Error[] }
  | { type: ActionType.SET_SERVICES; payload: SourceService<any, any>[] }
  | { type: ActionType.ADD_ERROR; payload: Error }
//#endregion

//#region Interfaces
export interface ContextState {
  appState:AppState
  debugMode:boolean
  lastCheckTimestamp:Date
  errorLog:Error[]
  activeServices:SourceService<any, any>[]

  toastMode:boolean
  soundMode:boolean
  checkForUpdateMode:boolean
  appName:string
  appVersion:string
  activeRoutes:string[]
  activeHooks:Hook[]
}

export interface NonUIContext {
  setToastMode(value:boolean):void
  setSoundMode(value:boolean):void
  setCheckForUpdateMode(value:boolean):void
  registerHook(type:HookType):void
  unregisterHook(type:HookType):void
  unregisterHooks():void
  registerRoute(path:string, component:FC):void
  unregisterRoute(path:string):void
  unregisterRoutes():void
}

export interface UIContext {
  readonly state:ContextState
  dispatch:Dispatch<UIAction>
  subscribe(origin:string, listener:()=>void):()=>void 
  onMount():Promise<void>
  onDismount():void
  reloadSources():Promise<void>
  setLastCheckTimestamp(timestamp: Date):void
  onTest():void
}

export interface AppContext extends UIContext, NonUIContext {}
//#endregion
//#endregion

//#region Application Context
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

export const AppContextProvider:FC<{children:ReactNode}> = ({children}) => {
  return (
    <AppContext.Provider value={AppService.getInstance()}>
      {children}
    </AppContext.Provider>
  )
}

export const withAppContext = <P extends object>(WrappedComponent:FC<P>):FC<P> => {
  return (props: P) => {
    return (
      <AppContextProvider><WrappedComponent {...props} /></AppContextProvider>
    )
  }
}
//#endregion

export const initialState:ContextState = {
  appState: AppState.BUSY,
  debugMode: DefaultSettings.debug,
  lastCheckTimestamp: new Date(1753),
  activeServices: [],
  errorLog: [],

  toastMode: true,
  soundMode: true,
  checkForUpdateMode: true,
  appName: "AutoFlatpaks",
  appVersion: "0.0.0",
  activeRoutes: [],
  activeHooks: [],
}

export class AppService implements AppContext {
  private constructor() {
    logger.debug("Creating AppService instance...")
  }
  // #region Singleton shared context handling
  private _state:ContextState = initialState
  public get state():ContextState { return {...this._state} }
  private static _instance: AppContext
  private listeners = new Set<{origin:string, callback:()=>void}>()
  static getInstance = ():AppContext => {
    if (!AppService._instance) { AppService._instance = new AppService() }
    return AppService._instance
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
  public dispatch = (action:UIAction):ContextState => {
    this._state = this.reducer(this.state, action)
    logger.debug(`Dispatch action: ${JSON.stringify(action)}`)
    this.notify()
    return this._state
  }
  private notify() { for (const listener of this.listeners){
    logger.debug(`Firing notification for ${listener.origin}`)
    listener.callback()}
  }
  private reducer(state:ContextState, action:UIAction):ContextState {
    switch (action.type) {
      case ActionType.SET_APPSTATE: return {...state, appState: action.payload}
      case ActionType.SET_DEBUGMODE: return {...state, debugMode: action.payload}
      case ActionType.SET_LASTCHECKTIMESTAMP: return {...state, lastCheckTimestamp: action.payload}
      case ActionType.SET_ERRORLOG: return {...state, errorLog: action.payload}
      case ActionType.ADD_ERROR: return {...state, errorLog: [...state.errorLog, action.payload]}
      case ActionType.SET_SERVICES: return {...state, activeServices: action.payload}
      default: return state
    }
  }
  // #endregion

  //#region UIContext Methods
  public onMount = async () => {
    logger.debug("Mounting plugin...")
    const {appName, appVersion} = await getAppInfo()
    this._state.appName = appName
    this._state.appVersion = appVersion
    logger.debug(`Loaded appInfo: ${appName}, ${appVersion}`)
    const lastCheckTimestamp = getLocalStorage(StorageKey.LAST_CHECKED_TIMESTAMP)
    if (lastCheckTimestamp) this.dispatch({type: ActionType.SET_LASTCHECKTIMESTAMP, payload: lastCheckTimestamp})
    logger.debug(`Loaded lastCheckTimestamp: ${lastCheckTimestamp}`)
    const {debug, checkOnBoot, unattendedUpgrades} = await SettingsManager.getSettings([SettingKey.debug, SettingKey.checkOnBoot, SettingKey.unattendedUpgrades])
    this.dispatch({type: ActionType.SET_DEBUGMODE, payload: debug ?? initialState.debugMode})
    await this.reloadSources()
    logger.debug("Handle plugin CheckOnBoot/UnattendedUpgrades...")
    if (checkOnBoot) {
      // ##TODO: Implement check on boot
      // Check for updates
      // var commandret:boolean = await call flatpak update and not update
      // if (!commandret) { return } // Check stderr for data. If no data, assume that the command didn't fail (calling flatpak update and then not updating returns 1)
      // Write lastCheckedTimestamp to localstorage
      if (!unattendedUpgrades) {
      // ##TODO: Implement unattended upgrades
        // await call flatpak update and update
      }
    }
    this.dispatch({type: ActionType.SET_APPSTATE, payload: AppState.IDLE})
  }
  public onDismount = () => {
    logger.debug("Dismounting plugin")
    this.unregisterRoutes()
    this.unregisterHooks()
  }
  public reloadSources = async () => {
    logger.debug("Reloading addon services...")
    let activeServices = []
    const { inactiveSources } = await SettingsManager.getSettings([SettingKey.inactiveSources])
    for (const PackageServiceKey in PackageServices) {
      if (inactiveSources?.includes(PackageServiceKey)) { 
        logger.debug("Service marked as inactive, skipping: ", PackageServiceKey)
        continue
      }
      const serviceInstance = new PackageServices[PackageServiceKey]()
      try {
        await serviceInstance._onMigrate()
        await serviceInstance.loadSettings()
        await serviceInstance._onLoad()
      } catch (error) {
        this.dispatch({type: ActionType.ADD_ERROR, payload: error instanceof Error ? error : new Error('Unknown error while loading source')})
      }
      activeServices.push(serviceInstance)
    }
    this.setServices(activeServices)
  }
  public setLastCheckTimestamp(timestamp:Date){
    setLocalStorage(StorageKey.LAST_CHECKED_TIMESTAMP, timestamp)
    this.dispatch({type: ActionType.SET_LASTCHECKTIMESTAMP, payload: timestamp})
  }
  private setServices(activeServices:SourceService<any, any>[]){
    const servicesToUnload = this.state.activeServices.filter(prevService => !activeServices.some(
      currentService => currentService.sourceKey === prevService.sourceKey
    ))
    for (const service of servicesToUnload) { service._onUnload() }
    this.dispatch({type: ActionType.SET_SERVICES, payload: activeServices})
  }
  public onTest = () => {}
  //#endregion

  //#region NonUIContext Methods
  //#region Mode Management
  public setToastMode(value: boolean){ this._state.toastMode = value }
  public setSoundMode(value: boolean){ this._state.soundMode = value }
  public setCheckForUpdateMode(value: boolean){ this._state.checkForUpdateMode = value }
  //#endregion
  //#region Hook Management
  public registerHook(type:HookType): void {
    if (this.state.activeHooks.some(hook => hook.type === type)) return
    const unregister:CallableFunction|undefined = ()=>{}
    const hook:Hook = {type:type, unregister: unregister}
    this._state.activeHooks.push(hook)
    // Add hook to activeHooks before checking if unregister function exists to prevent being able to continuously add more of the same hook
    if (!unregister) throw new Error('Registered hook without an unregister function, will not be able to clean up properly.')
  }
  public unregisterHook(type:HookType): void {
    const index = this.state.activeHooks.findIndex(hook => hook.type === type)
    if (index === -1) return
    const hook = this.state.activeHooks[index]
    if (hook.unregister) {
      hook.unregister()
      this._state.activeHooks = this.state.activeHooks.filter(({type}) => type !== hook.type)
    }
  }
  public unregisterHooks(): void {
    this.state.activeHooks.forEach(({type}) => { this.unregisterHook(type) })
  }
  //#endregion
  //#region Route Management
  public registerRoute(path: string, component: FC): void {
    if (this.state.activeRoutes.some(route => route === path)) return
    routerHook.addRoute(path, withAppContext(component))
    this._state.activeRoutes.push(path)
  }
  public unregisterRoute(path: string): void {
    const index = this.state.activeRoutes.findIndex(route => route === path)
    if (index === -1) return
    routerHook.removeRoute(path)
  }
  public unregisterRoutes(): void {
    this._state.activeRoutes.forEach(route => { this.unregisterRoute(route) })
  }
  //#endregion
  //#endregion
}


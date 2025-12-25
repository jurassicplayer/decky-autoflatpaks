import { SourceServiceCtor, SourceService } from "./source.service"
import { PackageServices } from "../services"
import { ComponentType, createContext, Dispatch, FC, ReactNode, useCallback, useContext, useReducer } from "react";
import { getAppInfo, logger } from "./backend";
import { SettingKey, SettingsManager } from "./plugin.settings";

// For autocomplete
export enum ActionType {
  SET_APPINFO = 'SET_APPINFO',
  SET_APPSTATE = 'SET_APPSTATE',
  SET_DEBUG = 'SET_DEBUG',
  SET_ERRORLOG = 'SET_ERRORLOG',
  SET_SERVICES = 'SET_SERVICES',
  ADD_ERROR = 'ADD_ERROR',
  RELOAD_SOURCES = 'RELOAD_SOURCES'
}
// For autocomplete
export enum AppState {
  IDLE = 'IDLE',
  BUSY = 'BUSY',
  FAIL = 'FAIL'
}

export type AppAction =
  | { type: ActionType.SET_APPINFO; payload: { appName: string; appVersion: string } }
  | { type: ActionType.SET_APPSTATE; payload: AppState }
  | { type: ActionType.SET_DEBUG; payload: boolean }
  | { type: ActionType.SET_ERRORLOG; payload: Error[] }
  | { type: ActionType.SET_SERVICES; payload: SourceService<any, any>[] }
  | { type: ActionType.ADD_ERROR; payload: Error }

export interface ContextState {
  serviceConstructors:Record<string, SourceServiceCtor<any, any>>
  activeServices:SourceService<any, any>[]
  errorLog:Error[]
  debug:boolean
  appName:string
  appVersion:string
  appState:AppState
}

export const initialState:ContextState = {
  serviceConstructors: PackageServices,
  activeServices: [],
  errorLog: [],
  debug: false,
  appName: "AutoFlatpaks",
  appVersion: "0.0.0",
  appState: AppState.BUSY
}

const appReducer = (state: ContextState, action: AppAction): ContextState => {
  switch (action.type) {
    case ActionType.SET_APPINFO: return {...state, appName: action.payload.appName, appVersion: action.payload.appVersion}
    case ActionType.SET_APPSTATE: return {...state, appState: action.payload}
    case ActionType.SET_DEBUG: return {...state, debug: action.payload}
    case ActionType.SET_ERRORLOG: return {...state, errorLog: action.payload}
    case ActionType.ADD_ERROR: return {...state, errorLog: [...state.errorLog, action.payload]}
    case ActionType.SET_SERVICES: return {...state, activeServices: action.payload}
    default: return state
  }
}

export interface AppContext {
  state: ContextState
  dispatch: Dispatch<AppAction>
  onMount(): Promise<void>
  onDismount(): Promise<void>
  reloadSources(): Promise<void>
  onTest(): void
}

const AppContext = createContext<AppContext|null>(null)
export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {throw new Error("useAppContext must be used within AppContextProvider")}
  return context
}

export const withAppContext = <P extends object>(WrappedComponent:ComponentType<P>):FC<P> => {
  return (props: P) => {
    return (
      <AppContextProvider><WrappedComponent {...props} /></AppContextProvider>
    )
  }
}

export const useAppContextInstance = ():AppContext => {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const onMount = useCallback(async ():Promise<void> => {
    logger.debug("Mounting plugin")
    const {appName, appVersion} = await getAppInfo()
    dispatch({type: ActionType.SET_APPINFO, payload: {appName, appVersion}})
    await reloadSources()
  }, [])
  const onDismount = useCallback(async ():Promise<void> => {
    logger.debug("Dismounting plugin")
  }, [])
  const reloadSources = useCallback(async ():Promise<void> => {
    logger.debug("Reloading addon services...")
    let activeServices = []
    const { inactiveSources } = await SettingsManager.getSettings([SettingKey.inactiveSources])
    for (const PackageServiceKey in state.serviceConstructors) {
      if (inactiveSources?.includes(PackageServiceKey)) { 
        logger.debug("Service marked as inactive, skipping: ", PackageServiceKey)
        continue
      }
      const serviceInstance = new state.serviceConstructors[PackageServiceKey]()
      try {
        await serviceInstance._onMigrate()
        await serviceInstance.loadSettings()
        await serviceInstance._onLoad()
      } catch (error) {
        dispatch({type: ActionType.ADD_ERROR, payload: error instanceof Error ? error : new Error('Unknown error while loading source')})
      }
      activeServices.push(serviceInstance)
    }
    dispatch({type: ActionType.SET_SERVICES, payload: activeServices})
  }, [])
  const onTest = useCallback(():void => {

  }, [])
  const contextValue:AppContext = {state, dispatch, onMount, onDismount, reloadSources, onTest}
  return contextValue
}

export const AppContextProvider:FC<{children:ReactNode}> = ({children}) => {
  const appContextInstance = useAppContextInstance()
  return (
    <AppContext.Provider value={appContextInstance}>
      {children}
    </AppContext.Provider>
  )
}
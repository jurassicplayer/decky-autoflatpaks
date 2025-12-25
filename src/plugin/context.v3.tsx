import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react"
import { ActionType, AppAction, ContextState, initialState } from "./context.v2"
import { logger } from "./backend"
import { SettingKey, SettingsManager } from "./plugin.settings"

export interface AppContext {
  state: ContextState
  dispatch: (action:AppAction)=>void
  subscribe: (listener:(prevState: ContextState)=>void) => ()=>void
  onMount: ()=>Promise<void>
  onDismount: ()=>Promise<void>
  reloadSources: ()=>Promise<void>
  onTest: ()=>void
}
export class PluginService implements AppContext{
  private static _instance: PluginService
  static getInstance = ():AppContext => {
    if (!PluginService._instance) {
      PluginService._instance = new PluginService()
    }
    return PluginService._instance
  }
  private constructor() {
    logger.debug("Creating PluginService instance...")
  }
  private listeners = new Set<(prevState: ContextState)=>void>()
  subscribe(listener: (prevState: ContextState)=>void) {
    this.listeners.add(listener)
    return ()=>this.listeners.delete(listener)
  }
  private notify(prevState: ContextState) {
    for (const listener of this.listeners){ listener(prevState) }
  }
  state = initialState
  dispatch = (action:AppAction) => {
    this.state = this.dispatchReducer(action)
    this.notify(this.state)
    return this.state
  }
  dispatchReducer = (action:AppAction) => {
    switch (action.type) {
      case ActionType.SET_APPINFO: return {...this.state, appName: action.payload.appName, appVersion: action.payload.appVersion}
      case ActionType.SET_APPSTATE: return {...this.state, appState: action.payload}
      case ActionType.SET_DEBUG: return {...this.state, debug: action.payload}
      case ActionType.SET_ERRORLOG: return {...this.state, errorLog: action.payload}
      case ActionType.ADD_ERROR: return {...this.state, errorLog: [...this.state.errorLog, action.payload]}
      case ActionType.SET_SERVICES: return {...this.state, activeServices: action.payload}
      default: return this.state
    }
  }
  onMount = async () => {
    logger.debug("Mounting plugin")
  }
  onDismount = async () => {
    logger.debug("Dismounting plugin")
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
  onTest = () => {

  }
}

const AppContext = createContext<AppContext|null>(null)
export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {throw new Error("useAppContext must be used within AppContextProvider")}
  return context
}
// export const useAppState = ():ContextState => {
//   const context = useAppContext()
//   const [, forceRender] = useState(0)

//   useEffect(() => {
//     // Re-render whenever the context state changes
//     const unsubscribe = context.subscribe(() => forceRender((t) => t+1))
//     return () => unsubscribe()
//   }, [context])
//   return context.state
// }
export const useAppState = ():ContextState => {
  const context = useAppContext()
  const [state, setState] = useState(context.state)
  useEffect(()=>{
    setState((prevState)=>{
      logger.debug("context state has changed, signalling all components utilizing app context")
      console.log(prevState)
      return context.state
    })
  }, [context.state])

  useEffect(()=>{
    const unsubscribe = context.subscribe(setState)
    return ()=>unsubscribe()
  }, [context])
  return state
}

export const AppContextProvider:FC<{children:ReactNode}> = ({children}) => {
  const context = PluginService.getInstance()
  return (
    <AppContext.Provider value={context}>
      {children}
    </AppContext.Provider>
  )
}
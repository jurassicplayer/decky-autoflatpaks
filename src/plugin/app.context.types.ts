import { Dispatch } from "react"
import { SourceServiceCtor, SourceService } from "./source.service"

// For autocomplete
export enum ActionType {
  SET_APPINFO = 'SET_APPINFO',
  SET_APPSTATE = 'SET_APPSTATE',
  SET_DEBUG = 'SET_DEBUG',
  SET_ERRORLOG = 'SET_ERRORLOG',
  SET_SERVICES = 'SET_SERVICES',
  ADD_ERROR = 'ADD_ERROR'
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

export interface AppContext {
  state: ContextState
  dispatch: Dispatch<AppAction>
  subscribe(origin:string, listener: ()=>void): ()=>void 
  onMount(): Promise<void>
  onDismount(): void
  reloadSources(): Promise<void>
  onTest(): void
}
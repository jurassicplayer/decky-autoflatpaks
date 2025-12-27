import { callable } from "@decky/api"

//#region Settings
export const loadSettings = callable<[], void>('loadSettings')
export const saveSettings = callable<[], void>('saveSettings')
export const getSettings = callable<[defaults: string], string>('getSettings')
export const setSettings = callable<[settings: string], void>('setSettings')
//#endregion

//#region Commands
type AppInfo = {
  appName: string
  appVersion: string
}
export const getAppInfo = callable<[], AppInfo>('getAppInfo')
// Need to come up with a structure for data passed to callcommand
// - environment variables
// - command
// - flags
// - parameters
// - timeout
// - data to enter when prompted?
// Or maybe just have separate python files for each service where they can define their own commands
export const callCommand = callable<any, any>('CallCommand')

// ##FIXME## Maybe extend logger to automatically send context dispatch on error/critical
export class logger {
  static loggingPrefix = '[AutoFlatpaks] '
  static consoleLog(prefix:string, msg:string, obj?:any){
    if (typeof obj !== 'undefined') {
      console.log(this.loggingPrefix, prefix, msg, obj)
    } else {
      console.log(this.loggingPrefix, prefix, msg)
    }
  }
  static debug(msg:string, obj?:any){
    this.consoleLog('Debug: ', msg, obj)
  }
  static info(msg:string, obj?:any){
    this.consoleLog('Info: ', msg, obj)
  }
  static warning(msg:string, obj?:any){
    this.consoleLog('Warning: ', msg, obj)
  }
  static error(msg:string, obj?:any){
    this.consoleLog('Error: ', msg, obj)
  }
  static critical(msg:string, obj?:any){
    this.consoleLog('Critical: ', msg, obj)
  }
}
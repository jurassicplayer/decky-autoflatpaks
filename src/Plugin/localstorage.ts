const keyPrefix = 'autoflatpaks-'
const prefix = (key:string) => keyPrefix+key


export enum LocalStorageKey {
  lastCheckTimestamp = 'lastCheckTimestamp'
}


export function setLocalStorage(key:string, value:any) {
  localStorage.setItem(prefix(key), JSON.stringify(value))
}
export function getLocalStorage(key:string, defaultValue:any = null) {
  let storedValue = localStorage.getItem(prefix(key)) || JSON.stringify(defaultValue)
  return JSON.parse(storedValue)
}
export function removeLocalStorage(key:string) {
  localStorage.removeItem(prefix(key))
}
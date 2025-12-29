//#region Time Conversions
export function splitMinutes(totalMinutes:number){
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  return {days, hours, minutes}
}
export function mergeMinutes(days:number, hours:number, minutes:number){
  return (days * 24 * 60) + (hours * 60) + minutes
}
//#endregion

//#region LocalStorage
//#region Storage Keys and Types
export enum StorageKey {
  LAST_CHECKED_TIMESTAMP = 'autoflatpaks.last_checked_timestamp'
}
type StorageType = {
  [StorageKey.LAST_CHECKED_TIMESTAMP]: Date
}
//#endregion
//#region Management Functions
export function getLocalStorage<K extends StorageKey>(key: K):StorageType[K]|null {
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) as StorageType[K] : null
}
export function setLocalStorage<K extends StorageKey>(key:K, value:StorageType[K]):void {
  localStorage.setItem(key, JSON.stringify(value))
}
export function clearLocalStorage() {
  Object.values(StorageKey).forEach(key => {
    localStorage.removeItem(key)
  })
}
//#endregion
//#endregion
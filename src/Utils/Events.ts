import { BatteryState, queueData, queueRetCode } from "./Backend.d"
import { FlatpakMetadata } from "./Flatpak"
export const eventTypes = {
  BatteryStateChange: 'BatteryStateChange',
  AppStateChange: 'AppStateChange',
  PackageListChange: 'PackageListChange',
  QueueProgress: 'QueueProgress',
  QueueCompletion: 'QueueCompletion'
}

export class eventGenerator {
  public static BatteryStateChange(batteryState: BatteryState) {
    return new CustomEvent(eventTypes.BatteryStateChange, {detail: {batteryState: batteryState}})
  }
  public static AppStateChange(state: number) {
    return new CustomEvent(eventTypes.AppStateChange, {detail: {state: state}})
  }
  public static PackageListChange(packageList: FlatpakMetadata[]) {
    return new CustomEvent(eventTypes.PackageListChange, {detail: {packageList: packageList}})
  }
  public static PackageChange(packageInfo: FlatpakMetadata) {
    return new CustomEvent(packageInfo.ref, {detail: {packageInfo: packageInfo}})
  }
  public static QueueProgress(queueItem: queueData, queueLength: number, queueProgress: number) {
    return new CustomEvent(eventTypes.QueueProgress, {detail: {queueItem: queueItem, queueLength: queueLength, queueProgress: queueProgress}})
  }
  public static QueueCompletion(queue: queueData[], queueLength: number, queueRetCode: queueRetCode[]) {
    return new CustomEvent(eventTypes.QueueCompletion, {detail: {queue: queue, queueLength: queueLength, queueRetCode: queueRetCode}})
  }
}
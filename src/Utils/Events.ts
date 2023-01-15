import { BatteryState, queueData, queueRetCode } from "./Backend.d"
import { FlatpakMetadata } from "./Flatpak"
export namespace events {
  export class AppStateEvent extends Event {
    public static eType: string = 'AppStateEvent'
    public appState: number
    constructor(appState: number, eventInitDict?: EventInit) {
      super(AppStateEvent.eType, eventInitDict)
      this.appState = appState
    }
  }
  export class BatteryStateEvent extends Event {
    public static eType: string = 'BatteryStateEvent'
    public batteryState: BatteryState
    constructor(batteryState: BatteryState, eventInitDict?: EventInit) {
      super(BatteryStateEvent.eType, eventInitDict)
      this.batteryState = batteryState
    }
  }
  export class PackageListEvent extends Event {
    public static eType: string = 'PackageListEvent'
    public packageList: FlatpakMetadata[]
    constructor(packageList: FlatpakMetadata[], eventInitDict?: EventInit) {
      super(PackageListEvent.eType, eventInitDict)
      this.packageList = packageList
    }
  }
  export class PackageInfoEvent extends Event {
    public eType: string
    public packageInfo: FlatpakMetadata
    constructor(packageInfo: FlatpakMetadata, eventInitDict?: EventInit) {
      super(packageInfo.ref, eventInitDict)
      this.eType = packageInfo.ref
      this.packageInfo = packageInfo
    }
  }
  export class UpdateListEvent extends Event {
    public static eType: string = 'UpdateListEvent'
    public updateList: string[]
    constructor(updateList: string[], eventInitDict?: EventInit) {
      super(UpdateListEvent.eType, eventInitDict)
      this.updateList = updateList
    }
  }
  export class QueueProgressEvent extends Event {
    public static eType: string = 'QueueProgressEvent'
    public queueItem: queueData
    public queueLength: number
    public queueProgress: number
    constructor(queueItem: queueData, queueLength: number, queueProgress: number, eventInitDict?: EventInit) {
      super(QueueProgressEvent.eType, eventInitDict)
      this.queueItem = queueItem
      this.queueLength = queueLength
      this.queueProgress = queueProgress
    }
  }
  export class QueueCompletionEvent extends Event {
    public static eType: string = 'QueueCompletionEvent'
    public queue: queueData[]
    public queueLength: number
    public queueRetCode: queueRetCode[]
    constructor(queue: queueData[], queueLength: number, queueRetCode: queueRetCode[], eventInitDict?: EventInit) {
      super(QueueCompletionEvent.eType, eventInitDict)
      this.queue = queue
      this.queueLength = queueLength
      this.queueRetCode = queueRetCode
    }
  }
}
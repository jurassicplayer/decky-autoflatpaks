import { toaster, ToastData } from "@decky/api"
import { logger } from "./backend"

/*##TODO: SourceService-specific toasts?
- How would I add them to the settings list?
- Should it be something exposed in the SourceService-specific settings?
- Should I expose a simple component that can be used to automatically create
  all of the options for the toast list given an enum? A dictionary of toastData?

*/
export enum AppNotificationType {
  UPDATE_AVAILABLE = 'UPDATE_AVAILABLE'
}

export type NotificationType = AppNotificationType | string

type NotificationRegistry = {
  [type in NotificationType]?: ToastData
}

const notificationRegistry:NotificationRegistry = {
  [AppNotificationType.UPDATE_AVAILABLE]: {
    title: undefined,
    body: undefined
  }
}
export function registerToasts(sourceKey:string, registry:NotificationRegistry){
  Object.entries(registry).forEach(([type, toastData]) => {
    if (!toastData) return
    if (!type) {
      logger.warning('Cannot register notification with empty type.')
      return
    }
    const notificationRegistryKey = `${sourceKey}.${type}`
    if (notificationRegistry[notificationRegistryKey]) {
      logger.warning(`Notification type ${type} is already registered.`)
      return
    }
  notificationRegistry[type] = toastData
  })
}
export function toast(type: NotificationType) {
  const toastData = notificationRegistry[type]
  if (!toastData) {
    logger.warning(`Unknown toast type: ${type}`)
    return
  }
  //##TODO: Check if showInBell or inactiveBellNotifications
  //##TODO: Check if showToast or inactiveToastNotifications
  //##TODO: Check if playSound or inactiveSoundNotifications
  toaster.toast(toastData)
}
//#endregion
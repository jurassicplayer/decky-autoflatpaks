import { Focusable, Toggle } from "decky-frontend-lib"
import { useEffect, useState } from "react"
import { Settings } from "../Utils/Settings"
import { NotificationsContainer, NotificationsText, NotificationsToggle } from "./NotificationToggles.css"

export function NotificationToggles() {
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(Settings.notificationEnabled)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(Settings.soundEnabled)

  const onNotificationToggle = (notificationEnabled: boolean) => { setNotificationEnabled(notificationEnabled) }
  const onSoundToggle = (soundEnabled: boolean) => { setSoundEnabled(soundEnabled) }

  useEffect(() => {
    if (Settings.soundEnabled != soundEnabled) Settings.soundEnabled = soundEnabled;
    if (Settings.notificationEnabled != notificationEnabled) Settings.notificationEnabled = notificationEnabled;
    Settings.saveToLocalStorage()
  }, [notificationEnabled, soundEnabled])

  return (
    <div style={NotificationsContainer}>
      <div style={NotificationsText} flow-children="horizontal">
        <div>Toast</div><div>Sound</div>
      </div>
      <Focusable
        style={NotificationsToggle}
        flow-children="horizontal">
        <Toggle
          value={notificationEnabled}
          onChange={onNotificationToggle}
        />
        <Toggle
          value={soundEnabled}
          onChange={onSoundToggle}
        />
      </Focusable>
    </div>
  )
}


import { Focusable, Toggle } from "decky-frontend-lib"
import { useEffect, useState } from "react"
import { Settings } from "../Utils/Settings"
import { NotificationsContainer, NotificationsText, NotificationsToggle } from "./NotificationToggles.css"

export function NotificationToggles() {
  const [componentReady, setComponentReady] = useState<boolean>(false)
  const [showToast, setShowToast] = useState<boolean>(Settings.showToast)
  const [playSound, setPlaySound] = useState<boolean>(Settings.playSound)

  const onNotificationToggle = (showToast: boolean) => { setShowToast(showToast) }
  const onSoundToggle = (playSound: boolean) => { setPlaySound(playSound) }

  useEffect(() => {
    setComponentReady(true)
  }, [])
  useEffect(() => {
    if (!componentReady) return
    if (Settings.playSound != playSound) Settings.playSound = playSound;
    if (Settings.showToast != showToast) Settings.showToast = showToast;
    Settings.saveToLocalStorage()
  }, [showToast, playSound])

  return (
    <div style={NotificationsContainer}>
      <div style={NotificationsText} flow-children="horizontal">
        <div>Toast</div><div>Sound</div>
      </div>
      <Focusable
        style={NotificationsToggle}
        flow-children="horizontal">
        <Toggle
          value={showToast}
          onChange={onNotificationToggle}
        />
        <Toggle
          value={playSound}
          onChange={onSoundToggle}
        />
      </Focusable>
    </div>
  )
}


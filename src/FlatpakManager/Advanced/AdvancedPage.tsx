import { DialogButton, Focusable } from "decky-frontend-lib"
import { useEffect, useState, VFC } from "react"
import { appStates, Backend } from "../../Utils/Backend"
import { eventTypes } from "../../Utils/Events"

const onRemoveUnusedPackages = () => {
  Backend.RemoveUnusedPackages()
}

export const AdvancedPage: VFC = () => {
  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const onAppStateChange = ((e: CustomEvent) => {
    if (!e.detail.state) return
    setAppState(e.detail.state)
  }) as EventListener
  useEffect(() => { Backend.eventBus.addEventListener(eventTypes.AppStateChange, onAppStateChange) }, [])
  useEffect(() => () => { Backend.eventBus.removeEventListener(eventTypes.AppStateChange, onAppStateChange) }, [])
  return (
    <div>
      <Focusable>
        <DialogButton
          disabled={appState != appStates.idle}
          onClick={() => onRemoveUnusedPackages()}>Remove Unused Packages</DialogButton>
      </Focusable>
      <h2>Work In Progress</h2>
      <p>
        This is a tentative area that will be a place for advanced functions that hopefully won't need to be used.
      </p>
      <ul>
        <li>Flatpak repair (and --dry-run?)</li>
        <li>List unused packages (flatpak remove --unused)</li>
        <li>Complex mask handling and controls</li>
        <li>Toggle for aggressive filtering for app (BaseApp, BaseExtension)</li>
        <li>Permissions Manager (GameMode integrated Flatseal maybe?)</li>
      </ul>
    </div>
  )
}
import { DialogButton, findSP, Focusable, showModal } from "decky-frontend-lib"
import { useEffect, useState, VFC } from "react"
import { appStates, Backend } from "../../Utils/Backend"
import { events } from "../../Utils/Events"
import { SteamUtils } from "../../Utils/SteamUtils"
import { UnusedPackagesModal } from "./UnusedPackages"

const checkRunningPackages = async () => {
  let result = false
  let runningList = await Backend.getRunningPackageList()
  console.log('Running List', runningList)
  if (runningList.length > 0) result = true
  return result
}
const flatpakRepair = async (dryrun?: boolean) => {
  if (await checkRunningPackages()) {
    SteamUtils.notify('AutoFlatpaks', 'Please close all flatpaks before repairing', true, true, 24) // 24: FailedNav sound effect
    return
  }
  let output = await Backend.RepairPackages(dryrun)
  console.log(dryrun ? 'Repair (dryrun): ': 'Repair: ', output)
}

export const AdvancedPage: VFC = () => {
  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const onAppStateChange = (e: Event) => { setAppState((e as events.AppStateEvent).appState) }
  
  useEffect(() => {
    Backend.eventBus.addEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])
  useEffect(() => () => {
    Backend.eventBus.removeEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])

  return (
    <Focusable>
      <Focusable>
        <DialogButton
          onClick={() => {showModal(<UnusedPackagesModal/>, findSP(), {popupHeight: 100})}}>
          Unused Packages
        </DialogButton>
        <DialogButton
          disabled={appState != appStates.idle}
          onOKActionDescription='Dryrun'
          onClick={() => flatpakRepair(true)}
          onSecondaryActionDescription='Repair'
          onSecondaryButton={() => flatpakRepair()}>
          Repair Packages
        </DialogButton>
      </Focusable>
      <h2>Work In Progress</h2>
      <p>
        This is a tentative area that will be a place for advanced functions that hopefully won't need to be used.
      </p>
      <ul>
        <li>Complex mask handling and controls (?)</li>
        <li>Toggle for aggressive filtering for app (BaseApp, BaseExtension, EoL packages) (?)</li>
        <li>Permissions Manager (GameMode integrated Flatseal maybe?)</li>
      </ul>
    </Focusable>
  )
}
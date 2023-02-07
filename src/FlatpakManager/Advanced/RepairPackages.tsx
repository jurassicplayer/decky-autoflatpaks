import { showModal } from "decky-frontend-lib"
import { useEffect, useState, VFC } from "react"
import { appStates, Backend } from "../../Utils/Backend"
import { events } from "../../Utils/Events"
import { RunningPackagesModal } from "./RunningPackages"
import { FallbackModal } from "../../InputControls/FallbackModal"
import { LabelButton } from "../../InputControls/LabelControls"
import { FaEllipsisH } from "react-icons/fa"

const flatpakRepair = async (dryrun?: boolean) => {
  let output = await Backend.RepairPackages(dryrun)
  console.log(dryrun ? 'Repair (dryrun): ': 'Repair: ', output)
}

const RepairPackagesModal = (props: any) => {
  const closeModal = () => {
    if (props.closeModal) { props.closeModal() }
  }
  return (
    <FallbackModal
      bDestructiveWarning={true}
      strTitle='Repair Broken Packages'
      strDescription='This process may take several minutes to complete and have no indication of progress beyond the status bar denoting that the process is either still running or complete. Refer to the flatpak-repair man page for more information on what this process entails.'
      strOKButtonText='DryRun'
      strMiddleButtonText='Run'
      onOK={() => {
        flatpakRepair(true)
        closeModal()
      }}
      onMiddleButton={() => {
        flatpakRepair()
        closeModal()
      }}
      closeModal={closeModal} />
  )
}

export const RepairPackages: VFC<{setShowStatusBar: CallableFunction}> = (props) => {
  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const onAppStateChange = (e: Event) => { setAppState((e as events.AppStateEvent).appState) }

  useEffect(() => {
    Backend.eventBus.addEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])
  useEffect(() => () => {
    Backend.eventBus.removeEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])

  return (
    <LabelButton
      label="Repair Broken Packages"
      description="Repair a flatpak installation by pruning and reinstalling invalid objects"
      disabled={appState != appStates.idle}
      onClick={() => {
        props.setShowStatusBar(false)
        Backend.getRunningPackages().then((runningPackages) => {
          if (runningPackages.length > 0) {
            props.setShowStatusBar(true)
            showModal(<RunningPackagesModal runningPackages={runningPackages} />)
          } else {
            showModal(<RepairPackagesModal />)
          }
        })
      }}>
      <FaEllipsisH />
    </LabelButton>
  )}
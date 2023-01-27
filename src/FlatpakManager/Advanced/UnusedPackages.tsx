import { DialogButton, findSP, Focusable, showModal } from "decky-frontend-lib"
import { CSSProperties, useEffect, useRef, useState, VFC } from "react"
import { appStates, Backend } from "../../Utils/Backend"
import { events } from "../../Utils/Events"
import { FallbackModal } from "../../InputControls/FallbackModal"
import { FlatpakUnused } from "../../Utils/Flatpak"
import { ScrollPanel } from "../../InputControls/ScrollPanel"

const onRemoveUnusedPackages = () => {
  Backend.RemoveUnusedPackages()
}
const UnusedListScrollPanel: CSSProperties = {
  maxHeight: Math.floor(findSP().window.innerHeight * 0.45),
  borderRadius: "7px",
  backgroundColor: "#121c25"
}
// const UnusedListContainer: CSSProperties = {
//   margin: "20px 20px 20px 20px",
//   paddingBottom: "15px",
//   display: "flex",
//   flexDirection: "column",
//   minWidth: "95%"
// }

const UnusedPackagesModal = (props: {closeModal?: CallableFunction}) => {
  const scrollView = useRef<HTMLDivElement>(null)
  const [scrollViewReady, setScrollViewReady] = useState<boolean>(false)
  const [unusedPackageList, setUnusedPackageList] = useState<FlatpakUnused[]>([])
  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const onAppStateChange = (e: Event) => { setAppState((e as events.AppStateEvent).appState) }
  const onQueueCompletion = () => getUnusedPackageList()
  const getUnusedPackageList = async () => {
    setScrollViewReady(false)
    let unusedPackageList = await Backend.getUnusedPackageList()
    setUnusedPackageList(unusedPackageList)
    setScrollViewReady(true)
  }
  const closeModal = () => {
    if (props.closeModal) { props.closeModal() }
  }

  useEffect(() => {
    Backend.eventBus.addEventListener(events.AppStateEvent.eType, onAppStateChange)
    Backend.eventBus.addEventListener(events.QueueCompletionEvent.eType, onQueueCompletion)
    getUnusedPackageList()
  }, [])
  useEffect(() => () => {
    Backend.eventBus.removeEventListener(events.AppStateEvent.eType, onAppStateChange)
    Backend.eventBus.removeEventListener(events.QueueCompletionEvent.eType, onQueueCompletion)
  }, [])

  return (
    <FallbackModal
      bAllowFullSize={true}
      bDisableBackgroundDismiss={false}
      bHideCloseIcon={false}
      strTitle='Unused Packages'
      closeModal={closeModal}
      bOKDisabled={!(appState == appStates.idle && unusedPackageList.length > 0)}
      strOKButtonText='Remove Packages'
      onOK={() => onRemoveUnusedPackages()}>
      <ScrollPanel
        style={UnusedListScrollPanel}
        focusable={true}
        autoFocus={true}
        noFocusRing={!scrollViewReady}>
        { scrollViewReady
        ? <Focusable
            style={{
              margin: "10px"
            }}
            // @ts-ignore
            focusableIfNoChildren={true}
            noFocusRing={true}
            ref={scrollView}>
            { unusedPackageList.map((item) => <div>{item.application} {item.branch}</div>) }
          </Focusable>
        : <div style={{height: "2em"}}>Searching for unused packages...</div>
        }
      </ScrollPanel>
    </FallbackModal>
  )
}

export const UnusedPackages: VFC = () => {
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
      <DialogButton
        style={{ margin: "4px" }}
        disabled={appState != appStates.idle}
        onClick={() => {showModal(<UnusedPackagesModal/>)}}>
        Unused Packages
      </DialogButton>
    </Focusable>
  )}
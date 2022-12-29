import { DialogButton, Focusable } from "decky-frontend-lib"
import { CSSProperties, useEffect, useRef, useState } from "react"
import { appStates, Backend } from "../../Utils/Backend"
import { events } from "../../Utils/Events"
import { FallbackModal } from "../../InputControls/FallbakModal"
import { FlatpakUnused } from "../../Utils/Flatpak"
import { ScrollPanel } from "../../InputControls/ScrollPanel"

const onRemoveUnusedPackages = () => {
  Backend.RemoveUnusedPackages()
}
export const UnusedListScrollPanel: CSSProperties = {
  height: "80%",
  //marginBottom: "4px",
  // padding: "10px 10px 10px",
  //flexGrow: "1",
  borderRadius: "7px",
  // display: "flex",
  //justifyContent: "center",
  backgroundColor: "#121c25",
  // flexDirection: "column"
}
export const UnusedListContainer: CSSProperties = {
  margin: "20px 20px 20px 20px",
  paddingBottom: "15px",
  display: "flex",
  flexDirection: "column",
  minWidth: "95%"
}

export const UnusedPackagesModal = (props: {closeModal?: CallableFunction}) => {
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
      closeModal={()=>{ if (props.closeModal) { props.closeModal() }}}>
      <Focusable
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          rowGap: "5px",
          overflow: "hidden"
        }}>
        <ScrollPanel
          style={UnusedListScrollPanel}
          focusable={true}
          autoFocus={true}
          noFocusRing={true} //!scrollViewReady}
          onClick={()=> scrollView.current?.focus()}
          onOKButton={()=> scrollView.current?.focus()}
          onButtonDown={(e: CustomEvent)=> {
            if (e.detail.button == 10) scrollView.current?.focus()
          }}>
          { scrollViewReady
          ? <Focusable
              style={{
                height: "18em",
                display: "flex",
                flexDirection: "column",
                margin: "10px"
              }}
              // @ts-ignore
              focusableIfNoChildren={true}
              noFocusRing={true}
              ref={scrollView}
              onSecondaryButton={()=>{setScrollViewReady(!scrollView)}}>
                { unusedPackageList.map((item) => {
                  return (
                    <div>{item.application} {item.branch}</div>
                  )
                })}
            </Focusable>
          : <div style={{height: "18em"}}>Searching for unused packages...</div>
          }
        </ScrollPanel>
        <DialogButton
            disabled={!(appState == appStates.idle && unusedPackageList.length > 0)}
            onClick={() => onRemoveUnusedPackages()}>Remove Unused Packages</DialogButton>
      </Focusable>
    </FallbackModal>
  )
}
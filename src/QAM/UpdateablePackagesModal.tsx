import { Focusable } from "decky-frontend-lib"
import { useRef, useState, useEffect, CSSProperties } from "react"
import { FallbackModal } from "../InputControls/FallbackModal"
import { ScrollPanel } from "../InputControls/ScrollPanel"
import { Backend } from "../Utils/Backend"
import { events } from "../Utils/Events"
import { SteamCssVariables } from "../Utils/SteamUtils"


export const UpdateListScrollPanel: CSSProperties = {
  maxHeight:"45vh",
  borderRadius: SteamCssVariables.gpCornerLarge,
  backgroundColor: SteamCssVariables.gpBackgroundLightSofter
}
export const UpdateablePackagesModal = (props: {closeModal?: CallableFunction}) => {
  const scrollView = useRef<HTMLDivElement>(null)
  const [updateList, setUpdateList] = useState<string[]>(Backend.getUpdateList())
  const onUpdateList = (e: Event) => {
    let event = e as events.UpdateListEvent
    setUpdateList(event.updateList)
  }

  const closeModal = () => {
    if (props.closeModal) { props.closeModal() }
  }

  useEffect(() => {
    // Register listener
    Backend.eventBus.addEventListener(events.UpdateListEvent.eType, onUpdateList)
  }, [])
  useEffect(() => () => {
    Backend.eventBus.removeEventListener(events.UpdateListEvent.eType, onUpdateList)
  }, [])

  return (
    <FallbackModal
      bAllowFullSize={true}
      bDisableBackgroundDismiss={false}
      bHideCloseIcon={false}
      strTitle="Available Updates"
      bAlertDialog={true}
      closeModal={closeModal}>
      <ScrollPanel
        style={UpdateListScrollPanel}
        focusable={true}
        autoFocus={true}
        onClick={()=> scrollView.current?.focus()}
        onOKButton={()=> scrollView.current?.focus()}
        onCancelButton={closeModal}
        onButtonDown={(e: CustomEvent)=> {
          if (e.detail.button == 9 || e.detail.button == 10) scrollView.current?.focus()
        }}>
          <Focusable
            style={{
              margin: "10px"
            }}
            // @ts-ignore
            focusableIfNoChildren={true}
            noFocusRing={true}
            onCancel={closeModal}
            ref={scrollView}>
              { updateList.map((item) => <div>{item}</div>) }
          </Focusable>
      </ScrollPanel>
    </FallbackModal>
  )
}
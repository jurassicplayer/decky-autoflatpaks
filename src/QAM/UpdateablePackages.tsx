import { Focusable, staticClasses } from "decky-frontend-lib"
import { useRef, useState, useEffect, CSSProperties } from "react"
import { FallbackModal } from "../InputControls/FallbakModal"
import { ScrollPanel } from "../InputControls/ScrollPanel"
import { Backend } from "../Utils/Backend"
import { events } from "../Utils/Events"


export const UpdateListScrollPanel: CSSProperties = {
  height: "80%",
  borderRadius: "7px",
  backgroundColor: "#121c25"
}
export const UpdateablePackagesModal = (props: {closeModal?: CallableFunction}) => {
  const scrollView = useRef<HTMLDivElement>(null)
  const [updateList, setUpdateList] = useState<string[]>(Backend.getUpdateList())
  const onUpdateList = (e: Event) => {
    let event = e as events.UpdateListEvent
    setUpdateList(event.updateList)
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
      closeModal={()=>{ if (props.closeModal) { props.closeModal() }}}>
      <Focusable
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          rowGap: "5px",
          overflow: "hidden"
        }}>
        <div className={staticClasses.PanelSectionTitle}>Available Updates ({updateList.length})</div>
        <ScrollPanel
          style={UpdateListScrollPanel}
          focusable={true}
          autoFocus={true}
          noFocusRing={true} //!scrollViewReady}
          onClick={()=> scrollView.current?.focus()}
          onOKButton={()=> scrollView.current?.focus()}
          onButtonDown={(e: CustomEvent)=> {
            if (e.detail.button == 10) scrollView.current?.focus()
          }}>
            <Focusable
              style={{
                height: "20em",
                display: "flex",
                flexDirection: "column",
                margin: "10px"
              }}
              // @ts-ignore
              focusableIfNoChildren={true}
              noFocusRing={true}
              ref={scrollView}>
                { updateList.map((item) => <div>{item}</div>) }
            </Focusable>
        </ScrollPanel>
      </Focusable>
    </FallbackModal>
  )
}
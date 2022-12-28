import { useEffect, useRef, useState, VFC } from "react"
import { Focusable, SteamSpinner } from "decky-frontend-lib"
import { Backend } from "../../Utils/Backend"
import { events } from "../../Utils/Events"
import { JournalEntry } from "../../Utils/History"
import { ScrollPanel } from "../../InputControls/ScrollPanel"
import { LogEntry } from "./LogEntry"
import { HistoryLogContainer, HistoryReadyScrollPanel, HistoryNotReadyScrollPanel } from "./LoggerPage.css"

export const LoggerPage: VFC = () => {
  const scrollView = useRef<HTMLDivElement>(null)
  const [history, setHistory] = useState<JournalEntry[]>([])
  const [historyReady, setHistoryReady] = useState<boolean>(false)
  const refreshHistory = () => {
    setHistoryReady(false)
    Backend.getPackageHistory().then((history) => setHistory(history)).then(() => setHistoryReady(true))
  }

  useEffect(() => {
    refreshHistory()
    Backend.eventBus.addEventListener(events.QueueProgressEvent.eType, refreshHistory)
  }, [])
  useEffect(() => () => { Backend.eventBus.removeEventListener(events.QueueProgressEvent.eType, refreshHistory) }, [])

  return (
    <ScrollPanel
      style={historyReady ? HistoryReadyScrollPanel : HistoryNotReadyScrollPanel}
      focusable={true}
      autoFocus={true}
      noFocusRing={false}
      onClick={()=> scrollView.current?.focus()}
      onOKButton={()=> scrollView.current?.focus()}
      onButtonDown={(e: CustomEvent)=> {
        if (e.detail.button == 10) scrollView.current?.focus()
      }}>
      <Focusable
        style={HistoryLogContainer}
        // @ts-ignore
        focusableIfNoChildren={true}
        noFocusRing={true}
        ref={scrollView}>
        { historyReady
        ? history
          .filter((entry) => entry.MESSAGE.includes('system:'))
          .map(entry => {return (
            <LogEntry entry={entry}/>
          )})
        : <div style={{minHeight: "100%"}}><SteamSpinner/></div> }
      </Focusable>
    </ScrollPanel>
  )
}



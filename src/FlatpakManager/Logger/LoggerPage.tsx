import { useEffect, useRef, useState, VFC } from "react"
import { Focusable, SteamSpinner } from "decky-frontend-lib"
import { Backend } from "../../Utils/Backend"
import { eventTypes } from "../../Utils/Events"
import { JournalEntry } from "../../Utils/History"
import { ScrollPanel } from "../../InputControls/ScrollPanel"
import { LogEntry } from "./LogEntry"
import { HistoryLogContainer, HistoryReadyScrollPanel, HistoryNotReadyScrollPanel } from "./LoggerPage.css"

export const LoggerPage: VFC = () => {
  const historyLogView = useRef<HTMLDivElement>(null)
  const [history, setHistory] = useState<JournalEntry[]>([])
  const [historyReady, setHistoryReady] = useState<boolean>(false)
  const refreshHistory = () => {
    setHistoryReady(false)
    Backend.getPackageHistory().then((history) => setHistory(history)).then(() => setHistoryReady(true))
  }

  useEffect(() => {
    console.log('Logs page loaded')
    refreshHistory()
    Backend.eventBus.addEventListener(eventTypes.QueueProgress, refreshHistory)
  }, [])
  useEffect(() => () => {
    console.log('Logs page unloaded')
    Backend.eventBus.removeEventListener(eventTypes.QueueProgress, refreshHistory)
  }, [])

  return (
    <ScrollPanel
      style={historyReady ? HistoryReadyScrollPanel : HistoryNotReadyScrollPanel}
      focusable={true}
      noFocusRing={false}
      onClick={()=> {historyLogView.current?.focus()}}
      onOKButton={()=> {historyLogView.current?.focus()}}>
      <Focusable
        style={HistoryLogContainer}
        // @ts-ignore
        focusableIfNoChildren={true}
        noFocusRing={true}
        ref={historyLogView}>
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



import { useEffect, useState } from "react"
import { PanelSectionRow } from "decky-frontend-lib"
import { appStates, Backend } from "../Utils/Backend"
import { StatusBarCSS } from "./StatusBar.css"
import { events } from "../Utils/Events"

export const StatusBar = () => {
  const onQueueProgress = (e: Event) => {
    let event = e as events.QueueProgressEvent
    setQueueProgress({
      currentItem: event.queueItem,
      queueProgress: event.queueProgress,
      queueLength: event.queueLength
    })
  }
  const onQueueCompletion = () => {
    setQueueProgress({
      currentItem: undefined,
      queueProgress: undefined,
      queueLength: undefined
    })
  }
  const onAppStateChange = (e: Event) => { setAppState((e as events.AppStateEvent).appState) }

  useEffect(() => {
    // Register listener
    Backend.eventBus.addEventListener(events.QueueProgressEvent.eType, onQueueProgress)
    Backend.eventBus.addEventListener(events.QueueCompletionEvent.eType, onQueueCompletion)
    Backend.eventBus.addEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])
  useEffect(() => () => {
    Backend.eventBus.removeEventListener(events.QueueProgressEvent.eType, onQueueProgress)
    Backend.eventBus.removeEventListener(events.QueueCompletionEvent.eType, onQueueCompletion)
    Backend.eventBus.removeEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])

  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const [queueProgress, setQueueProgress] = useState<{[key: string]: any}>({
    currentItem: Backend.getQueue()[0],
    queueProgress: Backend.getQueueProgress(),
    queueLength: Backend.getQueueLength()
  })

  let StatusText = ""
  let CSS = StatusBarCSS.Default
  if (appState == appStates.checkingForUpdates) {
    StatusText = "Checking for updates..."
    CSS = StatusBarCSS.CheckForUpdates
  } else if (appState == appStates.buildingPackageList) {
    StatusText = "Updating package list..."
    CSS = StatusBarCSS.CheckForUpdates
  } else if (appState == appStates.processingQueue) {
    StatusText = "Processing queue..."
    CSS = StatusBarCSS.ProcessingQueue
    if (queueProgress.currentItem && queueProgress.queueLength && queueProgress.queueProgress)
      StatusText = `(${queueProgress.queueProgress}/${queueProgress.queueLength}) ${queueProgress.currentItem.action} ${queueProgress.currentItem.packageRef}...`
  }
  return (

    <PanelSectionRow>
      { appState != appStates.idle 
      ? <div style={CSS}>{StatusText}</div>
      : null }
    </PanelSectionRow>
  )
}

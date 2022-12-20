import { useEffect, useState } from "react"
import { PanelSectionRow } from "decky-frontend-lib"
import { appStates, Backend } from "../Utils/Backend"
import { StatusBarCSS } from "./StatusBar.css"
import { eventTypes } from "../Utils/Events"

export const StatusBar = () => {
  const onQueueProgress = ((e: CustomEvent) => {
    if (!e.detail.queueLength) return
    console.log('Event (QueueProgress): ', e.detail)
    setQueueProgress({
      currentItem: e.detail.queueItem,
      queueProgress: Number(e.detail.queueProgress),
      queueLength: Number(e.detail.queueLength)
    })
  }) as EventListener
  const onQueueCompletion = ((e: CustomEvent) => {
    if (!e.detail.queueLength) return
    console.log('Event (QueueCompletion): ', e.detail)
    setQueueProgress({
      currentItem: undefined,
      queueProgress: undefined,
      queueLength: undefined
    })
  }) as EventListener
  const onAppStateChange = ((e: CustomEvent) => {
    if (!e.detail.state) return
    console.log('Event (AppState): Status bar')
    setAppState(e.detail.state)
  }) as EventListener

  useEffect(() => {
    console.log("Status bar loaded")
    // Register listener
    Backend.eventBus.addEventListener(eventTypes.QueueProgress, onQueueProgress)
    Backend.eventBus.addEventListener(eventTypes.QueueCompletion, onQueueCompletion)
    Backend.eventBus.addEventListener(eventTypes.AppStateChange, onAppStateChange)
  }, [])
  useEffect(() => () => {
    Backend.eventBus.removeEventListener(eventTypes.QueueProgress, onQueueProgress)
    Backend.eventBus.removeEventListener(eventTypes.QueueCompletion, onQueueCompletion)
    Backend.eventBus.removeEventListener(eventTypes.AppStateChange, onAppStateChange)
    console.log("Status bar unloaded")
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

import { useEffect, useState } from "react"
import { PanelSectionRow } from "decky-frontend-lib"
import { appStates, Backend } from "../Utils/Backend"
import { StatusBarCSS } from "./StatusBar.css"

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
    Backend.eventBus.addEventListener('QueueProgress', onQueueProgress)
    Backend.eventBus.addEventListener('QueueCompletion', onQueueCompletion)
    Backend.eventBus.addEventListener('AppStateChange', onAppStateChange)
  }, [])
  useEffect(() => () => {
    Backend.eventBus.removeEventListener('QueueProgress', onQueueProgress)
    Backend.eventBus.removeEventListener('QueueCompletion', onQueueCompletion)
    Backend.eventBus.removeEventListener('AppStateChange', onAppStateChange)
    console.log("Status bar unloaded")
  }, [])

  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const [queueProgress, setQueueProgress] = useState<{[key: string]: any}>({
    currentItem: Backend.getQueue()[0],
    queueProgress: Backend.getQueueProgress(),
    queueLength: Backend.getQueueLength()
  })

  let StatusText = ""
  if (appState == appStates.checkingForUpdates) {
    StatusText = "Checking for updates..."
  } else if (appState == appStates.processingQueue) {
    StatusText = "Processing queue..."
    if (queueProgress.currentItem && queueProgress.queueLength && queueProgress.queueProgress)
      StatusText = `(${queueProgress.queueProgress}/${queueProgress.queueLength}) ${queueProgress.currentItem.action} ${queueProgress.currentItem.packageRef}...`
  }
  return (

    <PanelSectionRow>
      { appState != appStates.idle 
      ? <div style={
        appState == appStates.checkingForUpdates
        ? StatusBarCSS.CheckForUpdates
        : appState == appStates.processingQueue
          ? StatusBarCSS.ProcessingQueue
          : StatusBarCSS.Default
        }>{StatusText}</div>
      : null }
    </PanelSectionRow>
  )
}

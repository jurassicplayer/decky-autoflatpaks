import { useEffect, useState } from "react"
import { DialogButton, findSP, PanelSectionRow, showModal } from "decky-frontend-lib"
import { appStates, Backend } from "../Utils/Backend"
import { StatusBarCSS } from "./StatusBar.css"
import { events } from "../Utils/Events"
import { UpdateablePackagesModal } from "./UpdateablePackages"

export const StatusBar = () => {
  const onUpdateList = (e: Event) => {
    let event = e as events.UpdateListEvent
    setUpdateList(event.updateList)
  }
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
    Backend.eventBus.addEventListener(events.UpdateListEvent.eType, onUpdateList)
    Backend.eventBus.addEventListener(events.QueueProgressEvent.eType, onQueueProgress)
    Backend.eventBus.addEventListener(events.QueueCompletionEvent.eType, onQueueCompletion)
    Backend.eventBus.addEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])
  useEffect(() => () => {
    Backend.eventBus.removeEventListener(events.UpdateListEvent.eType, onUpdateList)
    Backend.eventBus.removeEventListener(events.QueueProgressEvent.eType, onQueueProgress)
    Backend.eventBus.removeEventListener(events.QueueCompletionEvent.eType, onQueueCompletion)
    Backend.eventBus.removeEventListener(events.AppStateEvent.eType, onAppStateChange)
  }, [])

  const [updateList, setUpdateList] = useState<string[]>(Backend.getUpdateList())
  const [hover, setHover] = useState<boolean>(false)
  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const [queueProgress, setQueueProgress] = useState<{[key: string]: any}>({
    currentItem: Backend.getQueue()[0],
    queueProgress: Backend.getQueueProgress(),
    queueLength: Backend.getQueueLength()
  })

  let StatusText = ""
  let CSS = StatusBarCSS.Default
  let ShowUpdateList = (appState == appStates.idle && updateList.length > 0)
  if (ShowUpdateList) {
    StatusText = `${updateList.length} update${updateList.length > 1 ? 's' : ''} available`
    CSS = StatusBarCSS.CheckForUpdates
  } else if (appState == appStates.checkingForUpdates) {
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
      { appState != appStates.idle || (ShowUpdateList)
      ? <div style={CSS}>
          <DialogButton
            onGamepadFocus={() => setHover(true)}
            onGamepadBlur={() => setHover(false)}
            onOKActionDescription="Updates"
            onClick={() => {showModal(<UpdateablePackagesModal/>, findSP(), {popupHeight: 100})}}
            style={hover ? StatusBarCSS.HiddenButtonHover : StatusBarCSS.HiddenButton }
            disabled={!ShowUpdateList}>
            {StatusText}
          </DialogButton>
        </div>
      : null }
    </PanelSectionRow>
  )
}

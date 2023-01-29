import { useEffect, useState } from "react"
import { DialogButton, PanelSectionRow, showModal } from "decky-frontend-lib"
import { appStates, Backend } from "../Utils/Backend"
import { StatusBarCSS } from "./StatusBar.css"
import { events } from "../Utils/Events"
import { UpdateablePackagesModal } from "./UpdateablePackagesModal"

export const StatusBar = () => {
  const onAppStateChange = (e: Event) => {
    let event = e as events.AppStateEvent
    setAppState(event.appState)
  }
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

  const [updateList, setUpdateList] = useState<string[]>(Backend.getUpdateList())
  const [appState, setAppState] = useState<number>(Backend.getAppState())
  const [ShowUpdateList, setShowUpdateList] = useState<boolean>(appState == appStates.idle && updateList.length > 0)
  const [hover, setHover] = useState<boolean>(false)
  const [queueProgress, setQueueProgress] = useState<{[key: string]: any}>({
    currentItem: Backend.getQueue()[0],
    queueProgress: Backend.getQueueProgress(),
    queueLength: Backend.getQueueLength()
  })

  useEffect(() => {
    setShowUpdateList(appState == appStates.idle && updateList.length > 0)
  }, [appState, updateList])
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

  let StatusText = ""
  let CSS = StatusBarCSS.Default
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
  } else if (appState == appStates.repairingPackages) {
    StatusText = "Repairing packages..."
    CSS = StatusBarCSS.ProcessingQueue
  } else if (appState == appStates.migratingAppData) {
    StatusText = "Moving application data..."
    CSS = StatusBarCSS.ProcessingQueue
  }
  return (
    <PanelSectionRow>
      { appState != appStates.idle || ShowUpdateList
      ? <div style={CSS}>
          { ShowUpdateList
          ? <DialogButton
              onGamepadFocus={() => setHover(true)}
              onGamepadBlur={() => setHover(false)}
              onOKActionDescription="Updates"
              onClick={() => {showModal(<UpdateablePackagesModal/>)}}
              style={hover ? StatusBarCSS.HiddenButtonHover : StatusBarCSS.HiddenButton }
              disabled={!ShowUpdateList}>
              {StatusText}
            </DialogButton>
          : <div>{StatusText}</div> }
        </div>
      : null }
    </PanelSectionRow>
  )
}

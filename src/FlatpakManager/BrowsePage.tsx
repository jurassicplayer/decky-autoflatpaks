import { useEffect, useState, VFC } from "react"
import { Backend } from "../Utils/Backend"
import { FlatpakUpdate, LocalFlatpakMetadata, RemoteFlatpakMetadata } from "../Utils/Flatpak"
import FlatpakCard from "./FlatpakCard"
import { Focusable, SteamSpinner } from "decky-frontend-lib"

const getLocalPackagesList = async () => {
  return (await Backend.getLocalPackageList())
}
const getRemotePackagesList = async () => {
  return (await Backend.getRemotePackageList())
}
const getUpdateList = async () => {
  return (await Backend.getUpdates())
}
const getMaskList = async () => {
  return (await Backend.getMaskList())
}

export const BrowsePage: VFC = () => {
  const [appState, setAppState] = useState<string>(Backend.appState.state)
  const [lpl, setLPL] = useState<Array<LocalFlatpakMetadata>>([])
  const [rpl, setRPL] = useState<Array<RemoteFlatpakMetadata>>([])
  const [upl, setUPL] = useState<Array<FlatpakUpdate>>([])
  const [ml, setML] = useState<Array<string>>([])
  const [browseReady, setBrowseReady] = useState<boolean>(false)

  var unregister = Backend.RegisterForOnAppState((state: string)=>{
    setAppState(state)
  })

  const refresh = () => {
    // Y button or internal refresh
    setBrowseReady(false)
    var p1 = getLocalPackagesList().then(data => {
      if (data) setLPL(data)
    })
    var p2 = getRemotePackagesList().then(data => {
      if (data) setRPL(data)
    })
    var p3 = getUpdateList().then(data => {
      if (data) setUPL(data)
    })
    var p4 = getMaskList().then(data => {
      if (data) setML(data)
    })
    Promise.all([p1, p2, p3, p4]).then(() => setBrowseReady(true))
  }

  const ProcessQueue = async (e: CustomEvent) => {
    // X button
    console.log(e)
    console.log("Secondary button")
    await Backend.ProcessQueue()
    // Adding refresh here removes the need to worry about de-syncing, but because it's refreshing all data, uninstalled packages are removed from the list
    // Not refreshing maybe has a potential to de-sync (?), but most should be prevented. This allows the install page to keep uninstalled packages in the list until refreshed
    // refresh()
  }

  useEffect(() => {
    console.log("On browse page load")
    refresh()
  }, [])
  useEffect(()=>()=>{unregister()}, [])

  return (
    <div style={{ alignItems: "center", backgroundColor: "#0c1519", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100%"}}>
      {browseReady ?
        <Focusable
          onOptionsButton={refresh}
          onOptionsActionDescription="Refresh"
          onSecondaryButton={ProcessQueue}
          onSecondaryActionDescription="Apply"
          style={{ minWidth: "100%" }}>
          {lpl
            .filter(data => data.packagetype == "app")
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(data => {
              const CardContext = {
                masked: false,
                installed: true,
                updateable: false
              }
              if (ml.includes(data.ref)) CardContext.masked = true
              // Check flatpak update for updates (doesn't show masked packages, but shows partials)
              upl
                .filter(update => (update.application == data.application) && (update.branch == data.branch) && (update.remote == data.origin))
                .forEach((item)=>{ CardContext.updateable = true; console.log("upl: ", item) })
              // Check flatpak remote-ls for updates (shows masked packages, but doesn't show partials)
              rpl
                .filter(item => item.ref.includes(data.ref))
                .filter(item => data.active != item.commit)
                .forEach((item)=>{ CardContext.updateable = true; console.log("rpl: ", item) })
              return (<FlatpakCard data={data} context={CardContext} appState={appState}/>)
            })
          }
        </Focusable>
      : <SteamSpinner />}
    </div>
  )
}
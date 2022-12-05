import { DialogButton, Focusable, SteamSpinner, showModal, findSP } from "decky-frontend-lib"
import { FaRedoAlt } from "react-icons/fa"
import { VFC, useEffect, useState } from "react"
import { FPMOptions, OptionsModal } from "./OptionsModal"
import { Backend } from "../../Utils/Backend"
import { FlatpakMetadata } from "../../Utils/Flatpak"
import { FlatpakCard } from "./FlatpakCard"

export const BrowsePage: VFC = () => {
  const [browseReady,   setBrowseReady]   = useState<boolean>(false)
  const [packageList,   setPackageList]   = useState<FlatpakMetadata[]>(Backend.getPL())
  const [selectedOptions, setSelectedOptions] = useState<FPMOptions>({
    filterSearch: '',
    filterType: 'app',
    filterStatus: 'installed',
    filterMask: 'all',
    sortOrder: 'a2z'
  })

  const refreshBrowse = async (softRefresh?: boolean) => {
    setBrowseReady(false)
    if (softRefresh) {
      console.log('Soft Refresh')
      setPackageList(Backend.getPL())
      setTimeout(() => setBrowseReady(true), 50)
    } else {
      console.log('Hard Refresh')
      await Backend.getPackageList().then((packageList) => {setPackageList(packageList)}).then(() => setBrowseReady(true))
    }
  }
  const onQueueCompletion = ((e: CustomEvent) => {
    if (!e.detail.queueLength) return
    refreshBrowse(true)
  }) as EventListener

  useEffect(() => {
    console.log("Browse loaded")
    Backend.eventBus.addEventListener('QueueCompletion', onQueueCompletion)
    refreshBrowse()
  },[])
  useEffect(() => { if (browseReady) {refreshBrowse(true)} }, [selectedOptions])
  useEffect(() => () => {
    Backend.eventBus.removeEventListener('QueueCompletion', onQueueCompletion)
    console.log("Browse unloaded")
  }, [])

  return (
    <Focusable
      onOptionsButton={()=>{showModal(<OptionsModal selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} />, findSP())}}
      onOptionsActionDescription="Options"
      onSecondaryButton={()=>Backend.ProcessQueue()}
      onSecondaryActionDescription="Apply">
      { browseReady
      ? <div
        style={{ display: "flex", flexDirection: "column", maxHeight: "100%", overflow: "scroll" }}>
        <DialogButton onClick={()=>refreshBrowse()}><FaRedoAlt /></DialogButton>
        {packageList
          /*  Filter out packages with no description
              primarily because there are few, if any, relevant packages that people would install
              and don't have descriptions. This cuts out a lot of otherwise "duplicate" entries that
              wouldn't even be shown on flathub */
          //.filter(data => data.application.includes('.BaseApp'))
          //.filter(data => data.application.includes('.Debug'))
          .filter(data => {
            if (selectedOptions.filterSearch.length == 0) return true
            if (data.name.includes(selectedOptions.filterSearch) || data.description.includes(selectedOptions.filterSearch) || data.application.includes(selectedOptions.filterSearch) || data.ref.includes(selectedOptions.filterSearch) || data.origin.includes(selectedOptions.filterSearch)) return true
            return false
          })
          .filter(data => selectedOptions.filterType == 'all' || data.packagetype == selectedOptions.filterType)
          .filter(data => selectedOptions.filterMask == 'all' || (selectedOptions.filterMask == 'masked' && (data.parentMasked || data.masked)) || (selectedOptions.filterMask == 'unmasked' && (!data.parentMasked && !data.masked)))
          .filter(data => {
            if (selectedOptions.filterStatus == 'all') return true
            if (selectedOptions.filterStatus == 'installed' && data.installed) return true
            if (selectedOptions.filterStatus == 'notinstalled' && !data.installed) return true
            if (selectedOptions.filterStatus == 'updateable' && data.updateable) return true
            if (selectedOptions.filterStatus == 'queued' && Backend.getQueue().map(item => item.packageRef).includes(data.ref)) return true
            return false
          })
          .sort((a, b) => {
            if (selectedOptions.sortOrder == 'z2a') return b.name.localeCompare(a.name)
            if (selectedOptions.sortOrder == 'slarge' || selectedOptions.sortOrder == 'ssmall') {
              var aSize = a.installed_size.split(" ")
              var bSize = b.installed_size.split(" ")
              if (selectedOptions.filterStatus == 'uninstalled') {
                if (a.download_size && b.download_size) {
                  aSize = a.download_size.split(" ")
                  bSize = b.download_size.split(" ")
                }
              }
              var sizeRatio = {
                bytes: 1,
                kB: 1024,             //kibibyte
                MB: 1048576,          //mebibyte
                GB: 1073741824,       //gibibyte
                TB: 1099511627776,    //tebibyte
                PB: 1125899906842624  //pebibyte
              }
              var aBytes = Number(aSize[0]) * sizeRatio[aSize[1]]
              var bBytes = Number(bSize[0]) * sizeRatio[bSize[1]]
              if (isNaN(aBytes) || isNaN(bBytes)) console.log('Failed size conversion: ', aSize, bSize)
              if (selectedOptions.sortOrder == 'ssmall') {
                return aBytes - bBytes
              }
              return bBytes - aBytes
            }
            // Default to a2z if no other sorting set
            return a.name.localeCompare(b.name)
          })
          .map(data => {
            return(<FlatpakCard data={data} />)
          })
        }
      </div>
      : <div style={{minHeight: "100%", display:"flex", justifyContent: "center"}}><SteamSpinner/></div>
      }
    </Focusable>
  )
}
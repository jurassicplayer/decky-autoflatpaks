import { useEffect, useState, VFC } from "react"
import { Backend } from "../Utils/Backend"
import { FlatpakUpdate, LocalFlatpakMetadata, RemoteFlatpakMetadata } from "../Utils/Flatpak"
//import FlatpakCard from "./FlatpakCard"
import { DialogButton, Focusable, Spinner, Toggle } from "decky-frontend-lib"
import { FaEye, FaEyeSlash, FaTrashAlt, FaDownload } from "react-icons/fa"
import { Card } from "./BrowsePage.css"
import { ToggleButton } from "../InputControls/ToggleButton"

import { useInView } from "react-intersection-observer"

const getLocalPackagesList = async () => {
  return (await Backend.getLocalPackageList())
}

const getRemotePackagesList = async () => {
  return (await Backend.getRemotePackageList())
}

const getUpdateList = async () => {
  return (await Backend.CheckForUpdates())
}

const getMaskList = async () => {
  return (await Backend.getMaskList())
}

const onOptionsButton = (e: CustomEvent) => {
  console.log(e)
  console.log("Options button")
}
const onSecondaryButton = (e: CustomEvent) => {
  console.log(e)
  console.log("Secondary button")
}
// const queueAction = (actionType: string, appid: string, setter: CallableFunction) => {
//   // action types: install, uninstall, mask, unmask, update
//   console.log(`Queuing ${actionType} for ${appid}`)
//   // Add action to queue (including setter so flatpak component can get updated after action complete)
//   // var state = true
//   // setter(state)
// }

const FlatpakCard = (props: { data: LocalFlatpakMetadata, context: any }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px'
  })
  const [focus, setFocus] = useState<boolean>(false)
  const [install, setInstall] = useState<boolean>(props.context.installed)
  const [mask, setMask] = useState<boolean>(props.context.masked)
  const [update, setUpdate] = useState<boolean>(props.context.updateable)
  const [maskToggled, setMaskToggled] = useState<boolean>(false)
  const [updateToggled, setUpdateToggled] = useState<boolean>(false)
  const [installToggled, setInstallToggled] = useState<boolean>(false)
  const [uninstallToggled, setUninstallToggled] = useState<boolean>(false)

  useEffect(()=>{console.log("Creating card: ", props.data.application, props.context)},[])

  return (
    <div ref={ref}>
      {inView ? 
      <Focusable
        style={focus ? Card.focus : Card.blur}
        flow-children="horizontal"
        onFocus={()=>setFocus(true)}
        onBlur={()=>setFocus(false)}
        onOptionsButton={onOptionsButton}
        onSecondaryButton={onSecondaryButton}>
        <div className="FlatpakInfo"
          style={{ display: "flex", flexDirection: "column", overflow: "scroll" }}
          flow-children="vertical">
          <div>{props.data.name}</div>
          <div>{props.data.description}</div>
        </div>
        <Focusable
          style={{ display: "inline-flex" }}
          flow-children="horizontal">
          { mask ?
            <ToggleButton
              toggledCSS={Card.maskToggled}
              onClick={()=>{
                setMaskToggled(!maskToggled)
                maskToggled ? props.context.dequeueAction({action:'unmask', packageRef: props.data.ref, setter: setMask}) : props.context.queueAction({action:'unmask', packageRef: props.data.ref, setter: setMask})
            }}><FaEyeSlash /></ToggleButton>
          :
            <ToggleButton 
              toggledCSS={Card.maskToggled}
              onClick={()=>{
                setMaskToggled(!maskToggled)
                maskToggled ? props.context.dequeueAction({action:'mask', packageRef: props.data.ref, setter: setMask}) : props.context.queueAction({action:'mask', packageRef: props.data.ref, setter: setMask})
            }}><FaEye /></ToggleButton>
          }
          { update ? 
            <ToggleButton
              toggledCSS={Card.installToggled}
              disabled={uninstallToggled}
              onClick={()=>{
                setUpdateToggled(!updateToggled)
                updateToggled ? props.context.dequeueAction({action:'update', packageRef: props.data.ref, setter: setUpdate}) : props.context.queueAction({action:'update', packageRef: props.data.ref, setter: setUpdate})
              }}>
              <FaDownload />
            </ToggleButton>
          : null }
          { install ?
            <ToggleButton toggledCSS={Card.uninstallToggled} disabled={updateToggled} onClick={()=>{
              setUninstallToggled(!uninstallToggled)
              uninstallToggled ? props.context.dequeueAction({action:'uninstall', packageRef: props.data.ref, setter: setInstall}) : props.context.queueAction({action:'uninstall', packageRef: props.data.ref, setter: setInstall})
            }}><FaTrashAlt /></ToggleButton>
          :
            <ToggleButton toggledCSS={Card.installToggled} onClick={()=>{
              setInstallToggled(!installToggled)
              installToggled ? props.context.dequeueAction({action:'install', packageRef: props.data.ref, setter: setInstall}) : props.context.queueAction({action:'install', packageRef: props.data.ref, setter: setInstall})
            }}><FaDownload /></ToggleButton>
          }
        </Focusable>
      </Focusable>
      : null }
    </div>
  )
}

interface queueData {
  action: string
  packageRef: string
  setter: () => {}
}

export const BrowsePage: VFC = () => {
  const [lpl, setLPL] = useState<Array<LocalFlatpakMetadata>>([])
  const [rpl, setRPL] = useState<Array<RemoteFlatpakMetadata>>([])
  const [upl, setUPL] = useState<Array<FlatpakUpdate>>([])
  const [ml, setML] = useState<Array<string>>([])
  const [browseReady, setBrowseReady] = useState<boolean>(false)
  var queue: queueData[] = []
  const queueAction = (queueData: queueData) => {
    queue.push(queueData)
    console.log("queueAction: ", queue)
  }
  const dequeueAction = (queueData: queueData) => {
    queue = queue.filter(item => !(item.action == queueData.action && item.packageRef == queueData.packageRef))
    console.log("dequeueAction: ", queue)
  }

  useEffect(() => {
    console.log("On browse page load")
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
  }, [])

  return (
    <div style={{ alignItems: "center", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100%" }}>
      {browseReady ?
      <div>
        {lpl
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(data => {
            const CardContext = {
              masked: false,
              installed: true,
              updateable: false,
              queueAction: queueAction,
              dequeueAction: dequeueAction
            }
            if (ml.includes(data.application)) CardContext.masked = true
            upl.forEach((upldata) => { 
              if (upldata.application == data.application) CardContext.updateable = true
            })
            return (<FlatpakCard data={data} context={CardContext} />)
          })
        }
      </div>
      : <Spinner style={{maxWidth: "100px"}}/>}
    </div>
  )
}
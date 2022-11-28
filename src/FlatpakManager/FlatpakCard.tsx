import { Focusable } from "decky-frontend-lib"
import { FaDownload, FaTrashAlt, FaSyncAlt, FaEye, FaEyeSlash } from "react-icons/fa"
import { LocalFlatpakMetadata, RemoteFlatpakMetadata } from "../Utils/Flatpak"
import { useEffect, useState } from "react"
import { Backend } from "../Utils/Backend"
import { useInView } from "react-intersection-observer"
import { ToggleButton } from "../InputControls/ToggleButton"
import { Card } from "./FlatpakCard.css"

export interface CardContext {
  masked: boolean
  installed: boolean
  updateable: boolean
}

const FlatpakCard = (props: { data: LocalFlatpakMetadata | RemoteFlatpakMetadata, context: CardContext, appState: string }) => {
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

  const resetToggles = () => {
    setMaskToggled(false)
    setUpdateToggled(false)
    setInstallToggled(false)
  }

  useEffect(()=>{console.debug("Creating card: ", props.data, props.context, props.appState)},[])
  
  const queueActions = {
    mask: {
      action: 'mask',
      packageRef: props.data.ref,
      setter: () =>{
        resetToggles()
        setMask(true)
      }
    },
    unmask: {
      action: 'unmask',
      packageRef: props.data.ref,
      setter: () =>{
        resetToggles()
        setMask(false)
      }
    },
    update: {
      action: 'update',
      packageRef: props.data.ref,
      setter: () =>{
        resetToggles()
        setUpdate(false)
      }
    },
    install: {
      action: 'install',
      packageRef: props.data.ref,
      setter: () =>{
        resetToggles()
        setInstall(true)
      }
    },
    uninstall: {
      action: 'uninstall',
      packageRef: props.data.ref,
      setter: () =>{
        resetToggles()
        setUpdate(false)
        setInstall(false)
      }
    }
  }

  return (
    <div ref={ref}>
      {inView ? 
      <Focusable
        style={focus ? Card.focus : Card.blur}
        flow-children="horizontal"
        onFocus={()=>setFocus(true)}
        onBlur={()=>setFocus(false)}>
        <div className="FlatpakInfo"
          style={{ display: "flex", flexDirection: "column", overflow: "scroll" }}
          flow-children="vertical">
          <div>{props.data.name}</div>
          <div>{props.data.description}</div>
        </div>
        <Focusable
          style={{ display: "inline-flex" }}
          flow-children="horizontal">
          <ToggleButton
            toggledCSS={Card.maskToggled}
            disabled={props.appState != 'Idle'}
            value={maskToggled}
            onOKActionDescription={maskToggled ? 'Dequeue' : 'Queue' }
            onOKButton={()=>{
              setMaskToggled(!maskToggled)
              maskToggled
                ? Backend.dequeueAction(mask ? queueActions.mask : queueActions.unmask)
                : Backend.queueAction(mask ? queueActions.unmask : queueActions.mask)
            }}>
            { mask ? <FaEyeSlash /> : <FaEye /> }
          </ToggleButton>
          { update ? 
            <ToggleButton
              toggledCSS={Card.installToggled}
              disabled={installToggled || props.appState != 'Idle'}
              value={updateToggled}
              onOKActionDescription={updateToggled ? 'Dequeue' : 'Queue' }
              onOKButton={()=>{
                setUpdateToggled(!updateToggled)
                updateToggled ? Backend.dequeueAction(queueActions.update) : Backend.queueAction(queueActions.update)
              }}>
              <FaSyncAlt />
            </ToggleButton>
          : null }
          <ToggleButton toggledCSS={install ? Card.uninstallToggled : Card.installToggled}
            disabled={updateToggled || props.appState != 'Idle'}
            value={installToggled}
            onOKActionDescription={installToggled ? 'Dequeue' : 'Queue' }
            onOKButton={()=>{
              setInstallToggled(!installToggled)
              installToggled
                ? Backend.dequeueAction(install ? queueActions.install : queueActions.uninstall)
                : Backend.queueAction(install ? queueActions.uninstall : queueActions.install)
            }}>
            { install ? <FaTrashAlt /> : <FaDownload /> }
          </ToggleButton>
        </Focusable>
      </Focusable>
      : null }
    </div>
  )
}

export default FlatpakCard
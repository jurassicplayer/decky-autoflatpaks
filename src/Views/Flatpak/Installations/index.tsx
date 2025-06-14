import { DialogBody, DialogButton, DialogControlsSection, Focusable, ModalRoot, showModal } from "@decky/ui"
import { useEffect } from "react"
import { FaPlusSquare, FaRedoAlt } from "react-icons/fa"
import { useSignals } from "@preact/signals-react/runtime"
import context from "../../../Plugin/context"
import { InstallationsState, InstallationType } from "../../../Plugin/interfaces/installations"
import { InstallationItemSettings, InstallationItemSettingsModalProps } from "./Components/installationSettings"
import { InstallationListItem } from "./Components/installationListItem"
import { ButtonCSS, FlexRow } from "../../../Plugin/common.css"
import { FlexGrowDiv } from "../../../Components/FlexGrow"


function AddInstallationModal(props: InstallationItemSettingsModalProps){
  let newEntry = {sectionName: crypto.randomUUID(), displayName: '', path: '', priority: 0, configFile: InstallationsState.configFiles.find(e => typeof e !== 'undefined') ?? 'THIS_SHOULD_ONLY_HAPPEN_IF_NO_CONFIGS_EXIST'}
  const closeModal = ()=>{if (props.closeModal) props.closeModal()}
  const onAddInstallation = (entry: InstallationType) => {
    InstallationsState.installations.push(entry)
  }
  return (
    <ModalRoot
      onCancel={closeModal}
      onEscKeypress={closeModal}>
      <InstallationItemSettings entry={newEntry} setEntry={onAddInstallation} isModal={true} closeModal={closeModal}/>
    </ModalRoot>
  )
}

function Content(){
  useSignals()
  useEffect(()=>{
    InstallationsState.refreshState()
    InstallationsState.selected = null
  },[])
  const showAddInstallationModal = () => {
    InstallationsState.selected = null
    showModal(<AddInstallationModal />)
  }
  const onRefreshState = () => InstallationsState.refreshState()
  return (
    <DialogBody>
      <DialogControlsSection>
        <div style={FlexRow}>
          <FlexGrowDiv></FlexGrowDiv>
          <Focusable style={FlexRow}>
            {context.debugEnabled
              ? <DialogButton style={ButtonCSS} onClick={()=>console.log(InstallationsState)}>state</DialogButton>
              : null}
            <DialogButton style={ButtonCSS} onClick={onRefreshState}><FaRedoAlt/></DialogButton>
            <DialogButton style={ButtonCSS} onClick={showAddInstallationModal}><FaPlusSquare/></DialogButton>
          </Focusable>
        </div>
        {InstallationsState.installations.map(installation => <InstallationListItem entry={installation}/>)}
      </DialogControlsSection>
    </DialogBody>
  )
}

export default Content





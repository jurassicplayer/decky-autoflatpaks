import { showModal, Focusable, DropdownItem, DialogButton, TextField } from "@decky/ui"
import { useState } from "react"
import { FaArrowDown, FaArrowUp, FaFolderOpen, FaPlusSquare } from "react-icons/fa"
import { ConfirmationModal, NameModal } from "../../../../Components/NameModal"
import { TError } from "../../../../Plugin/common"
import context from "../../../../Plugin/context"
import { EStorageType, InstallationType, InstallationsState, floatingInstallation } from "../../../../Plugin/interfaces/installations"
import { InstallationPrefDetails } from "../installations.css"
import { getFolderExists } from "../../../../Plugin/pyinterops"
import { ButtonCSS, FlexRow } from "../../../../Plugin/common.css"
import { FilePickerRes, FileSelectionType, openFilePicker } from "@decky/api"
import { FlexGrowDiv } from "../../../../Components/FlexGrow"

interface InstallationItemSettingsProps extends InstallationItemSettingsModalProps {
  entry: InstallationType
  setEntry: (entry: InstallationType)=>void
}
export interface InstallationItemSettingsModalProps {
  isModal?: boolean
  closeModal?(): void
}
export function InstallationItemSettings(props: InstallationItemSettingsProps){
  const [entry, setEntry] = useState<InstallationType>(props.entry)
  const [newConfigFile, setNewConfigFile] = useState<string>("")
  const closeModal = ()=>{if (props.closeModal) props.closeModal()}
  const onWarningAcknowledged = (entry: InstallationType) => {
    props.setEntry(entry)
    // ##FIXME## Create config file and Save installation settings here
    // Delete from config if exists
    floatingInstallation.installations = floatingInstallation.installations.filter(installation => installation.sectionName != props.entry.sectionName)
    // Add to config
    floatingInstallation.installations.push(entry)
  }
  const onSave = async (entry: InstallationType) => {
    let warnings: TError[] = []
    // verify current settings
    if (!entry.displayName) warnings.push({message: `Missing installation display name.`, errorID: "NoDisplayName"})
    if (!(await getFolderExists(entry.path))) warnings.push({message: `Installation path "${entry.path}" doesn't exist.`, errorID: "FolderNotFound"})
    
    if (warnings.length > 0) {
      let warningsFormatted = warnings.map(warn => warn.message).flatMap((x) => [<br />, x]).slice(1)
      showModal(<ConfirmationModal
        onOK={()=>{
          onWarningAcknowledged(entry)
          closeModal()
        }}
        strTitle="Warning"
        strDescription={warningsFormatted}
        />)
    } else {
      props.setEntry(entry)
      closeModal()
    }
  }
  const createNewConfigFile = (name: string) => {
    if (!name) return
    name = name + ".conf"
    setNewConfigFile(name)
    setEntry({...entry, configFile:name})
  }
  const showNewConfigModal = ()=>{
    showModal(<NameModal
      strTitle="New Config File"
      strTextFieldDescription="Name of the configuration file, will be created in /etc/flatpak/installations.d/"
      name=""
      setName={createNewConfigFile}
      />
    )
  }
  const onBrowseForInstallationPath = ()=>{
    openFilePicker(
      FileSelectionType.FOLDER,
      (entry.path != "" ? entry.path : "/"),
      false,
      true,
      undefined,
      undefined,
      true
    ).then((result:FilePickerRes) => {
      setEntry({...entry, path: result.realpath})
    })
  }

  return (
    <Focusable
      style={props.isModal ? InstallationPrefDetails.Modal : InstallationPrefDetails.NoModal}
      onCancel={closeModal}>
      <Focusable style={FlexRow}>
        <FlexGrowDiv>
          <DropdownItem
            label="Config File"
            bottomSeparator="none"
            highlightOnFocus={false}
            rgOptions={
              newConfigFile
              ? [{label: newConfigFile, data: newConfigFile}, ...InstallationsState.configFiles.map(file => ({label: file, data: file}))]
              : InstallationsState.configFiles.map(file => ({label: file, data: file}))
            }
            selectedOption={entry.configFile}
            onChange={selected=>setEntry({...entry, configFile:selected.data})}
            />
        </FlexGrowDiv>
        <DialogButton style={ButtonCSS} onClick={showNewConfigModal}><FaPlusSquare/></DialogButton>
      </Focusable>
      {props.isModal
        ? <TextField
            label="Installation Name"
            value={entry.displayName}
            onChange={(event)=>setEntry({...entry, displayName: event.currentTarget.value})}
            />
        : null
      }
      <TextField
        label="Installation Path"
        value={entry.path}
        requiredLabel="Required"
        inlineControls={<DialogButton style={ButtonCSS} onOKButton={onBrowseForInstallationPath}><FaFolderOpen /></DialogButton>}
        onChange={(event)=>setEntry({...entry, path: event.currentTarget.value})}
        />
      <TextField
        label="Priority"
        value={(entry.priority??0).toString()}
        disabled={true}
        inlineControls={
          <Focusable style={FlexRow}>
            <DialogButton
              style={ButtonCSS}
              onOKButton={()=>setEntry({...entry, priority: (entry.priority??0)+1})}>
              <FaArrowUp/>
            </DialogButton>
            <DialogButton
              style={ButtonCSS}
              onOKButton={()=>setEntry({...entry, priority: (entry.priority??0)-1})}>
              <FaArrowDown/>
            </DialogButton>
          </Focusable>
        }
        />
      <DropdownItem
        label="Storage Type"
        bottomSeparator="none"
        highlightOnFocus={false}
        rgOptions={Object.keys(EStorageType).map(storagetype => ({label: EStorageType[storagetype as keyof typeof EStorageType], data: storagetype}))}
        selectedOption={entry.storageType}
        onChange={selected=>setEntry({...entry, storageType:selected.data})}
        />
      <Focusable style={{display: "flex", flexDirection: "row", justifyContent: "flex-end"}}>
      {JSON.stringify(entry) != JSON.stringify(props.entry) && entry.path != ""
        ? <DialogButton
            style={ButtonCSS}
            onOKButton={()=>onSave(entry)}
            onOKActionDescription="Save">
              Save
          </DialogButton>
        : null}
      {context.debugEnabled
        ? <DialogButton
            style={ButtonCSS}
            onOKButton={()=>console.log(entry)}
            onOKActionDescription="Save">
              entry
          </DialogButton>
        : null}
      </Focusable>
    </Focusable>
  )
}
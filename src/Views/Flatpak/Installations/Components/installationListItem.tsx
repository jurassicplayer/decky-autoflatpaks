import { showModal, Focusable, DialogButton } from "@decky/ui"
import { useState, useEffect } from "react"
import { ConfirmationModal, NameModal } from "../../../../Components/NameModal"
import { InstallationsState, InstallationType } from "../../../../Plugin/interfaces/installations"
import { SteamChevronDown } from "../../../../Utils/steam"
import { SteamCss } from "../../../../Utils/steam.css"
import { InstallationItemSettings } from "./installationSettings"
import { ButtonCSS } from "../../../../Plugin/common.css"

const deleteInstallation: ()=>Promise<void> = async () => {
  console.log(`hurl something into the void`)
}

interface InstallationListItemProps {
  entry: InstallationType
}
export function InstallationListItem(props: InstallationListItemProps){
  const [entry, setEntry] = useState<InstallationType>(props.entry)
  const onRename = (name: string) => setEntry(prev => ({...prev, displayName: name}))
  const showNameModal = ()=>{
    showModal(<NameModal
      strTitle="Rename Installation"
      strLabel="Installation Name"
      strTextFieldDescription="The display name of this installation"
      name={entry.displayName??entry.sectionName}
      setName={onRename}/>)
  }
  const onDelete = ()=>{
    deleteInstallation()
    InstallationsState.installations = InstallationsState.installations.filter(installation => installation.sectionName != entry.sectionName)
    InstallationsState.selected = null
  }
  const showDeleteModal = ()=>{
    showModal(<ConfirmationModal
      strTitle="Delete Confirmation"
      strDescription="Are you sure you want to delete this installation?"
      onOK={onDelete}
      />)
  }
  const [selected, setSelected] = useState<boolean>(InstallationsState.selected == props.entry)
  useEffect(()=> setSelected(InstallationsState.selected == props.entry),[InstallationsState.selected])
  useEffect(()=> setEntry(props.entry),[props.entry])

  return (
    <Focusable
      style={selected ? SteamCss.NotificationGroupExpanded : SteamCss.NotificationGroup}>
      <Focusable 
        style={{...SteamCss.NotificationSection, alignItems: "center"}}
        onSecondaryButton={showNameModal}
        onSecondaryActionDescription="Rename"
        onOptionsButton={showDeleteModal}
        onOptionsActionDescription="Delete">
        <div style={{...SteamCss.NotificationDescription, paddingLeft: "1ex"}}>
          {entry.displayName ?? entry.sectionName}
        </div>
        <DialogButton
          style={ButtonCSS} 
          onClick={() => {
            InstallationsState.selected = InstallationsState.selected != props.entry ? props.entry : null
          }}>
          <SteamChevronDown style={selected ? {...SteamCss.PrefDetailsToggle, ...SteamCss.PrefDetailsSelected} : SteamCss.PrefDetailsToggle }/>
        </DialogButton>
      </Focusable>
      { selected ?
        <InstallationItemSettings entry={entry} setEntry={setEntry}/>
      : null }
    </Focusable>
  )
}
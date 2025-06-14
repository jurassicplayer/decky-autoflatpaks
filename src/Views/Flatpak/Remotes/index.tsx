import { DialogBody, DialogButton, DialogControlsSection, DialogControlsSectionHeader, DropdownItem, Focusable, showModal, TextField } from "@decky/ui"
import { useEffect } from "react"
import { FaArrowDown, FaArrowUp, FaFolderOpen, FaHome, FaPlusSquare, FaRedoAlt } from "react-icons/fa"
import { useSignals } from "@preact/signals-react/runtime"
import context from "../../../Plugin/context"
import { InstallationsState, systemInstallation, userInstallation } from "../../../Plugin/interfaces/installations"
import { ButtonCSS, FlexRow, HalfButton } from "../../../Plugin/common.css"
import { FlexGrowDiv } from "../../../Components/FlexGrow"
import { getDeckyUserHome, getFolderExists, Installation } from "../../../Plugin/pyinterops"

interface AddRemoteModalProps {
  closeModal?(): void
}
function AddRemoteModal(props: AddRemoteModalProps) {
  const [lastUsedPath, setLastUsedPath] = useState<string>('')
  useEffect(()=>{
    onInit()
  },[])
  const onInit = async () => {
    let lastUsedPath = localStorage.getItem('decky-autoflatpaks')
    let deckyUserHome = (await getDeckyUserHome())
    let path = lastUsedPath || deckyUserHome
    setLastUsedPath(path)
  }
  const [remoteLocation, setRemoteLocation] = useState<string>("")
  const [remoteParentInstallation, setRemoteParentInstallation] = useState<string>(InstallationsState.installations.map(installation => installation.sectionName).find(e => typeof e !== 'undefined') ?? 'THIS_SHOULD_ONLY_HAPPEN_IF_NO_INSTALLATIONS_EXIST')
  const onSave = async ()=>{
      console.log(`Saving RemoteLocation: ${remoteLocation} RemoteInstallation: ${remoteParentInstallation}`)
      // await Call `flatpak remote-add --if-not-exists remoteName remoteLocation --installation=remoteParentInstallation/--user/--system
      await InstallationsState.refreshState()
  }
  const onBrowseForRemotePath = () => {
    openFilePicker(
      FileSelectionType.FILE,
      lastUsedPath,
      undefined,
      undefined,
      undefined,
      ["flatpakrepo"],
      true,
      false
    ).then((result:FilePickerRes) => {
      localStorage.setItem('decky-autoflatpaks', result.realpath)
      getFolderExists(result.realpath)
        .then(isFolder => !isFolder ? setRemoteLocation(result.realpath):null)
    })
  }
  return (
    <ConfirmationModal
      {...props}
      onOK={onSave}
      strOKButtonText="Save">
      <Focusable>
        <DropdownItem
          label="Installation"
          rgOptions={InstallationsState.installations.map(installation => ({label: installation.displayName, data: installation.sectionName}))}
          selectedOption={remoteParentInstallation}
          onChange={selected=>setRemoteParentInstallation(selected.data)}
          />
        <TextField
          label="Remote Path"
          requiredLabel="Required"
          description="Enter a Flatpak repository URI (*.flatpakrepo)"
          value={remoteLocation}
          inlineControls={<DialogButton style={ButtonCSS} onOKButton={onBrowseForRemotePath}><FaFolderOpen /></DialogButton>}
          onChange={(event)=>setRemoteLocation(event.currentTarget.value)}
          />
        {context.debugEnabled
          ? <DialogButton
              style={ButtonCSS}
              onOKButton={()=>console.log(`RemoteLocation: ${remoteLocation} RemoteInstallation: ${remoteParentInstallation}`)}
              onOKActionDescription="debug">
                entry
            </DialogButton>
          : null}
      </Focusable>
    </ConfirmationModal>
  )
}


function Content(){
  const [installations, setInstallations] = useState<string[]>([])
  useSignals()
  useEffect(()=>{
    InstallationsState.refreshState()
    InstallationsState.selected = null
    injectUserSysInstallations()
  },[])
  useEffect(()=>{injectUserSysInstallations()}, [InstallationsState.installations, InstallationsState.installationRemotesMap])
  const injectUserSysInstallations = () => {
    let installations = InstallationsState.installations.map(installation => installation.sectionName)
    Installation.getUserInstallationPath().then((userInstallationPath) => {
      installations.splice(InstallationsState.userSysInsertIdx, 0, systemInstallation.sectionName)
      if (userInstallationPath){ installations.splice(InstallationsState.userSysInsertIdx, 0, userInstallation.sectionName) }
      console.log(`Installations Post-Injection: `, installations)
      setInstallations(installations)
    })
  }
  const showAddRemoteModal = () => {
    InstallationsState.selected = null
    showModal(<AddRemoteModal/>)
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
            <DialogButton style={ButtonCSS} onClick={showAddRemoteModal}><FaPlusSquare/></DialogButton>
          </Focusable>
        </div>
        {installations.map(installation => <RemoteList installationSectionName={installation} remotes={InstallationsState.installationRemotesMap[installation]}/>)}
      </DialogControlsSection>
    </DialogBody>
  )
}

export default Content

function RemoteList(props: {installationSectionName: string, remotes: RemoteType[]}) {
  const installationName = InstallationsState.installations.find(installation => installation.sectionName == props.installationSectionName)?.displayName
    ?? (props.installationSectionName == 'user'
      ? 'User'
      : (props.installationSectionName == 'default'
        ? 'System'
        : props.installationSectionName))
  const [loaded, setLoaded] = useState(false)
  useEffect(()=>{ if (props.remotes) setLoaded(true) },[])
  return (<>
    {loaded ? <div>
      <DialogControlsSectionHeader>{installationName}</DialogControlsSectionHeader>
        {props.remotes.map(remote => <RemoteListItem entry={remote} />)}
      </div>
    : null}
  </>)
}


import { useState } from "react"
import { RemoteType } from "../../../Plugin/interfaces/remotes"
import { FilePickerRes, FileSelectionType, openFilePicker } from "@decky/api"
import NameModal, { ConfirmationModal } from "../../../Components/NameModal"
import { SteamCss, SteamCssVariables } from "../../../Utils/steam.css"

const deleteRemote: ()=>Promise<void> = async () => {
  console.log(`hurl something into the void`)
}
interface RemoteListItemProps {
  entry: RemoteType
}
function RemoteListItem(props:RemoteListItemProps) {
  const [entry, setEntry] = useState<RemoteType>(props.entry)
  useEffect(()=>{setEntry(props.entry)},[props.entry])
  console.log(props.entry)
  const onRename = (name: string) => setEntry(prev => ({...prev, name: name}))
  const showNameModal = ()=>{
    showModal(<NameModal
      strTitle="Rename Remote"
      strLabel="Remote Name"
      strTextFieldDescription="The display name of this remote"
      name={entry.name}
      setName={onRename}/>)
  }
  const onDelete = ()=>{
    deleteRemote()
    //InstallationsState.remotes = InstallationsState.remotes.filter(remote => remote.name != entry.name)
    InstallationsState.installationRemotesMap[entry.installationSectionName] = InstallationsState.installationRemotesMap[entry.installationSectionName].filter(remote => remote.name != entry.name)
    InstallationsState.selected = null
  }
  const showDeleteModal =()=>{
    showModal(<ConfirmationModal
      strTitle="Delete Confirmation"
      strDescription="Are you sure you want to delete this remote?"
      onOK={onDelete}
      />)
  }
  const onPriority = (direction: number) => {
    //let idx = InstallationsState.remotes.findIndex(remote => remote.name == entry.name && remote.installationSectionName == entry.installationSectionName)
    //InstallationsState.remotes[idx] = {...entry, priority: entry.priority+direction}
    let idx = InstallationsState.installationRemotesMap[entry.installationSectionName].findIndex(remote => remote.name == entry.name && remote.installationSectionName == entry.installationSectionName)
    InstallationsState.installationRemotesMap[entry.installationSectionName][idx] = {...entry, priority: entry.priority+direction}
    InstallationsState.reSortInstallationRemote()
  }
  return (
    <Focusable style={{...FlexRow, ...SteamCss.NotificationGroup, ...SteamCss.NotificationSection}}
      onSecondaryButton={showNameModal}
      onSecondaryActionDescription="Rename"
      onOptionsButton={showDeleteModal}
      onOptionsActionDescription="Delete">
      <FlexGrowDiv style={{paddingLeft: "1ex"}}>{entry.name}</FlexGrowDiv>
      <span style={{fontSize: "1.5ex", color:"rgba(255,255,255,.5)"}}>Priority: {entry.priority}</span>
      <DialogButton
        style={ButtonCSS}
        onOKButton={()=>console.log(entry)}>
        <FaHome/>
      </DialogButton>
      <DialogButton
        style={HalfButton}
        onOKButton={()=>onPriority(1)}>
        <FaArrowUp/>
      </DialogButton>
      <DialogButton
        style={HalfButton}
        onOKButton={()=>onPriority(-1)}>
        <FaArrowDown/>
      </DialogButton>
    </Focusable>
  )
}
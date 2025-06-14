import { DialogButton, DialogControlsSectionHeader, Focusable, GamepadButton, GamepadEvent, GamepadEventDetail } from "@decky/ui"
import { useEffect, useRef, useState } from "react"
import { ButtonCSS, FlexRow, HalfButton } from "../../Plugin/common.css"
import { SteamCss } from "../../Utils/steam.css"
import { FlexGrowDiv } from "../../Components/FlexGrow"
import { FaArrowDown, FaArrowUp, FaHome } from "react-icons/fa"


function Content(){
  const [loaded, setLoaded] = useState(false)
  const [installations, setInstallations] = useState<TInstallationLocation[]>()
  const [selectedInstallation, setSelectedInstallation] = useState<TInstallationLocation>()
  const [selectedRepository, setSelectedRepository] = useState<TRepositoryEntry>()
  const [selectedColumn, setSelectedColumn] = useState(0)
  useEffect(()=>{
    init().then(()=>setLoaded(true))
  },[])
  const init = async ()=>{
    console.log(`Initializing component`)
    console.log(`Pulling installation information`)
    let repositories:TRepositoryEntry[] = [{
      installationName: "Default",
      name: "flathub",
      priority: 0,
      homepage: "http://google.com"
    },
    {
      installationName: "Default",
      name: "flathub-beta",
      priority: 1,
      homepage: "http://google.com"
    }]
    let repositoriesUser:TRepositoryEntry[] = [{
      installationName: "User",
      name: "flathub",
      priority: 0,
      homepage: "http://google.com"
    },
    {
      installationName: "User",
      name: "flathub-beta",
      priority: 1,
      homepage: "http://google.com"
    }]
    let installations:TInstallationLocation[] = [{
      name: "Default",
      repositories: repositories
    },
    {
      name: "User",
      repositories: repositoriesUser
    }]
    console.log(`Obtained installation information`, installations)
    setInstallations(installations)
    setSelectedInstallation(installations[0])
    setSelectedRepository(installations[0].repositories[0])
  }
  return (<>
    {loaded && installations ?
      <>
      {installations.map(installation =>
        <InstallationLocation
          name={installation.name}
          repositories={installation.repositories}
          selected={selectedInstallation == installation}
          selectedRepository={selectedRepository}
          setSelectedRepository={setSelectedRepository}
          selectedColumn={selectedColumn}
          setSelectedColumn={setSelectedColumn}/>
      )}
      </>
    : null}
  </>)
}



type TInstallationLocation = {
  name:string
  repositories:TRepositoryEntry[]
}
interface IInstallationLocationProps extends TInstallationLocation {
  selected:boolean
  selectedRepository?:TRepositoryEntry
  setSelectedRepository:(selectedRepository:TRepositoryEntry) => void
  selectedColumn:number
  setSelectedColumn:(selectedColumn:number) => void
}
function InstallationLocation(props:IInstallationLocationProps){
  let {name, repositories, selected, selectedRepository, setSelectedRepository, selectedColumn, setSelectedColumn} = props
  return (
    <>
      <DialogControlsSectionHeader>{name}</DialogControlsSectionHeader>
      {repositories.map(repository =>
        <RepositoryEntry
          installationName={repository.installationName}
          repositories={repositories}
          installationSelected={selected}
          selected={selectedRepository == repository}
          selectedRepository={selectedRepository}
          setSelectedRepository={setSelectedRepository}
          selectedColumn={selectedColumn}
          setSelectedColumn={setSelectedColumn}
          name={repository.name}
          priority={repository.priority}
          homepage={repository.homepage}/>
      )}
    </>
  )
}



type TRepositoryEntry = {
  installationName:string
  name:string
  priority:number
  homepage:string
}
interface IRepositoryEntryProps extends TRepositoryEntry{
  repositories:TRepositoryEntry[]
  installationSelected:boolean
  selected:boolean
  selectedRepository?:TRepositoryEntry
  setSelectedRepository:(selectedRepository:TRepositoryEntry) => void
  selectedColumn:number
  setSelectedColumn:(selectedColumn:number) => void
}
function RepositoryEntry(props:IRepositoryEntryProps){
  let {name, priority, homepage, repositories, installationSelected, selected, selectedRepository, setSelectedRepository, selectedColumn, setSelectedColumn} = props
  const homeButton = useRef<HTMLInputElement>(null)
  const priorityUpButton = useRef<HTMLInputElement>(null)
  const priorityDownButton = useRef<HTMLInputElement>(null)
  useEffect(()=>{
    // Force button focus on selectedRow or selectedColumn change
    if (installationSelected && selected){
      console.log(`Refocusing to current selected column element: `, selectedColumn)
      switch (selectedColumn){
        case 0: {
          focusSteamElement(homeButton.current)
          break
        }
        case 1: {
          focusSteamElement(priorityUpButton.current)
          break
        }
        case 2: {
          focusSteamElement(priorityDownButton.current)
          break
        }
      } 
    }
  }, [installationSelected, selected, selectedRepository, selectedColumn])

  const focusSteamElement = (element:HTMLElement|null) => {
    if(!element) return
    element.focus()
  }

  const onButtonDown = (event: Event)=>{
    let e = event as GamepadEvent
    let detail = e.detail as GamepadEventDetail
    console.log(installationSelected, selected, e, event)
    if (!selectedRepository) return
    console.log(`selectedColumn: `, selectedColumn)
    if (detail.button == GamepadButton.DIR_RIGHT) {
      setSelectedColumn(selectedColumn >= 2 ? selectedColumn : selectedColumn+1)
    } else if (detail.button == GamepadButton.DIR_LEFT) {
      setSelectedColumn(selectedColumn <= 0 ? selectedColumn-1 : selectedColumn)
    } else if (detail.button == GamepadButton.DIR_UP) {
      let repositoryIndex = repositories.indexOf(selectedRepository)
      setSelectedRepository(repositoryIndex <= 0 ? repositories[repositoryIndex] : repositories[repositoryIndex-1])
    } else if (detail.button == GamepadButton.DIR_DOWN) {
      let repositoryIndex = repositories.indexOf(selectedRepository)
      setSelectedRepository(repositoryIndex >= repositories.length ? repositories[repositoryIndex+1] : repositories[repositoryIndex])
    }
    // if(!selected) return
    // let newSelectedColumn = 0
    // switch(e){
    //   case homeButton.current: {
    //     newSelectedColumn = 0
    //     break
    //   }
    //   case priorityUpButton.current: {
    //     newSelectedColumn = 1
    //     break
    //   }
    //   case priorityDownButton.current: {
    //     newSelectedColumn = 2
    //     break
    //   }
    // }
    // setSelectedColumn(newSelectedColumn)
  }
  const onPriority = (increment: number)=>{
    console.log(props)
  }
  return (
    <Focusable style={{...FlexRow, ...SteamCss.NotificationGroup, ...SteamCss.NotificationSection}}
      onButtonDown={onButtonDown}
      // onSecondaryButton={showNameModal}
      onSecondaryActionDescription="Rename"
      // onOptionsButton={showDeleteModal}
      onOptionsActionDescription="Delete">
      <FlexGrowDiv style={{paddingLeft: "1ex"}}>{name}</FlexGrowDiv>
      <span style={{fontSize: "1.5ex", color:"rgba(255,255,255,.5)"}}>Priority: {priority}</span>
      <DialogButton
        ref={homeButton}
        style={ButtonCSS}
        onOKButton={()=>console.log(props)}>
        <FaHome/>
      </DialogButton>
      <DialogButton
        ref={priorityUpButton}
        style={HalfButton}
        onOKButton={()=>onPriority(1)}>
        <FaArrowUp/>
      </DialogButton>
      <DialogButton
        ref={priorityDownButton}
        style={HalfButton}
        onOKButton={()=>onPriority(-1)}>
        <FaArrowDown/>
      </DialogButton>
    </Focusable>
  )
}

export default Content



interface SteamElement {
  m_node: NavNode
}
interface NavNode {
  m_Properties: NavNodeProperties
  BTakeFocus: ()=>boolean
  BChildTakeFocus: ()=>boolean
}
interface NavNodeProperties {
  childFocusDisabled: boolean|undefined
  focusableIfNoChildren: boolean|undefined
}
import { DialogButton, Field, Focusable, Menu, MenuItem, showContextMenu } from "@decky/ui"
import { CSSProperties, ReactNode, useEffect, useReducer, useRef, useState } from "react"
import { FaDownload, FaEllipsisH, FaRecycle } from "react-icons/fa"
import { ReorderableListV2, inheritCurrentOrder } from '../../../Components/ReorderableList/ReorderableList'
import { ReorderableEntry } from '../../../Components/ReorderableList/ReorderableItem'

interface Installation {
  name: string  // sectionName
  displayName: string
  path: string
  priority: number
  enabled: boolean
  configFile?: string  // config file path
  storageType?: string
}

const getInstallationInfo:()=>Installation[] = () => {
  let installations = []
  installations.push({name: 'default', displayName: 'System', path: '/var/flatpak', priority: 0, enabled: false})
  installations.push({name: 'user', displayName: 'User', path: '/home/jplayer/flatpak', priority: 0, enabled: true})
  installations.push({name: 'ExtraPlace', displayName: 'ExtraPlace', path: '/var/etc/flatpak', priority: 1, enabled: true})
  return installations
}

interface InstallationListProps {

}

function Content(props: InstallationListProps){
  const toReorderableEntries = (installations: Installation[]) => [...installations]
    .sort((a,b) =>  a.priority - b.priority ||
                    a.name.localeCompare(b.name))
    .sort((a,b) =>  a.name == 'default' && b.name == 'user' ? 1:0 ||
                    a.name == 'user' && b.name == 'default' ? -1:0)
                                    
                                      
  const [entries, setEntries] = useState<ReorderableEntry<Installation>>()
  const onSave = (entries: ReorderableEntry<Installation>[]) => {
    // save ordering here
  }
  return (
    <ReorderableListV2<Installation> entries={[]} onSave={onSave} />
  )
}

// interface InstallationComponentProps {
//   entry: EntryData
//   onEnable(entry: EntryData): void
//   onDisable(entry: EntryData): void
// }
// interface IObjectKey {
//   [key: string]: any
// }
// interface EntryData extends IObjectKey{
//   name: string
//   path: string
//   priority: number
//   enabled: boolean
//   elementFocus?: number
// }
// function MyFancyComponent(props: MyFancyComponentProps) {
//   const {name, path, priority, enabled, elementFocus} = props.entryData
//   const {onEnable, onDisable, onElementFocus} = props
//   useEffect(() => {
//     console.log(`Initialize MyFancyComponent`)
//     console.log(`Current element focus: `, elementFocus)
//     return () => {
//       console.log(`Deinitialize MyFancyComponent`)
//     }
//   },[])
//   let css:CSSProperties = {minWidth: "40px"}
//   return (
//     <>
//       <Focusable style={{display: "flex", flexDirection: "row"}}>
//       {/* <Focusable
//         autoFocus={(elementFocus && elementFocus == ElementID.BUTTON1) ? true: false}
//         onGamepadFocus={()=>onElementFocus(props.entryData, ElementID.BUTTON1)}> */}
//         <DialogButton
//           style={css}
//           onClick={()=>onEnable(props.entryData)}>{name} Enable</DialogButton>
//       {/* </Focusable>

//       <Focusable
//         autoFocus={(elementFocus && elementFocus == ElementID.BUTTON2) ? true: false}
//         onGamepadFocus={()=>onElementFocus(props.entryData, ElementID.BUTTON2)}> */}
//       <DialogButton style={css} disabled={!enabled} onClick={()=>onDisable(props.entryData)}>{name} Disable</DialogButton>
//       {/* </Focusable> */}
//       </Focusable>
//     </>
//   )
// }

// function Content() {
//   const entriesData = getInstallationInfo()
//   const onListUpdate = () => {
//     console.log(`Calling onListUpdate`)
//     setEntries((prev) => [...prev])
//   }
//   const onEnable = (entryData: EntryData) => {
//     console.log(`Calling on Enable`)
//     let idx = entriesData.indexOf(entryData)
//     let newEntries = [...entries]
//     newEntries[idx].entryData.enabled = true
//     setEntries(newEntries)
//   }
//   const onDisable = (entryData: EntryData) => {
//     console.log(`Calling on Disable`)
//     let idx = entriesData.indexOf(entryData)
//     let newEntries = [...entries]
//     newEntries[idx].entryData.enabled = false
//     setEntries(newEntries)
//   }
//   const onElementFocus = (entryData: EntryData, focus: ElementID) => {
//     console.log(`Calling on ElementFocus`)
//     // let idx = entriesData.indexOf(entryData)
//     let newEntries = [...entries]
//     newEntries.forEach(entry => entry.entryData.elementFocus = focus)
//     setEntries(newEntries)
//   }
//   const generateEntries = () => {
//     entriesData.sort((a,b) => a.priority - b.priority)
//     return entriesData.map((entryData) => ({
//         entryData: entryData,
//         component: MyFancyComponent,
//         componentData: {
//           entryData: entryData,
//           onEnable: onEnable,
//           onDisable: onDisable,
//           onElementFocus: onElementFocus
//         }
//       })
//     )
//   }
//   const [entries, setEntries] = useState(generateEntries())
//   useEffect(() => {
//     console.log(`Initialize Content`)
//     return () => {
//       console.log(`Deinitialize Content`)
//     }
//   },[])
//   return (
//     <>
//       <ROList<EntryData,MyFancyComponentProps> entries={entries} onListUpdate={onListUpdate}/>
//     </>
//   )
// }
// enum ElementID {
//   BUTTON1,
//   BUTTON2,
//   BUTTON3
// }
// interface MyFancyComponentProps extends JSX.IntrinsicAttributes {
//   entryData: EntryData
//   onEnable: (entryData: EntryData)=>void
//   onDisable: (entryData: EntryData)=>void
//   onElementFocus: (entryData: EntryData, focus: ElementID.BUTTON1 | ElementID.BUTTON2 | ElementID.BUTTON3)=>void
// }


export default Content
import { Field, FieldProps, GamepadEvent, GamepadButton } from "@decky/ui"
import { CSSProperties, ReactNode, useEffect, useState } from "react"

/**
 * Intermediary interfaces to be extended
 */
// #region ReorderableEntry
interface IReorderableEntryExtendedProps {
  defaultCSS?: CSSProperties
  activeCSS?: CSSProperties
  inactiveCSS?: CSSProperties
  onSecondaryActionDescriptionActive?: string
  onSecondaryActionDescriptionInactive?: string
  fieldProps?: FieldProps
}
interface IReorderableEntry<T> {
  data: T
  component: (props: ReorderableEntryProps<T>) => ReactNode
}
interface IReorderableListExtendedProps extends IReorderableEntryExtendedProps {
  animate?: boolean
}
interface IReorderableList<T> {
  entries: IReorderableEntry<T>[]
  onListUpdate: (newData: T[]) => void
}
// #endregion

// #region Internal interfaces
/**
 * This interface is used internally to pass all reorderable entry data from the ReorderableList
 * over to the ReorderableItem. This should not be exposed to the user.
 * 
 * Properties:
 * - onShiftPosition
 * - onSecondaryAction
 * - onUnfocus
 * - children
 * - defaultCSS
 * - activeCSS
 * - inactiveCSS
 * - onSecondaryActionDescriptionActive
 * - onSecondaryActionDescriptionInactive
 * - fieldProps
 * - data<T>
 * - component
 * - selected
 * - position
 * - reorderActive
 * - animate
 * 
 */
interface IReorderableItemProps<T> extends IReorderableListExtendedProps, IReorderableEntry<T>, ReorderableEntryProps<T> {
  onShiftPosition: (position: number, offset: number) => void
  onSecondaryAction: (position: number, selected: boolean) => void
  onUnfocus: () => void
  children?: ReactNode
}
// #endregion

/**
 * This interface is to expose reorderable entry properties to the user's custom component,
 * including the entry's current position, if currently selected, and if reordering mode is
 * currently active.
 * 
 * Usage:
 *   `function MyCustomComponent(props: ReorderableEntryProps<T>) {...}`
 * 
 * Properties:
 * - selected
 * - position
 * - reorderActive
 * - data<T>
 * - defaultCSS
 * - activeCSS
 * - inactiveCSS
 * - onSecondaryActionDescriptionActive
 * - onSecondaryActionDescriptionInactive
 * - fieldProps
 */
export interface ReorderableEntryProps<T> extends Omit<IReorderableEntry<T>, "component">, IReorderableEntryExtendedProps {
  selected: boolean
  position: number
  reorderActive: boolean
}

export interface ReorderableListProps<T> extends IReorderableList<T>, IReorderableListExtendedProps {
  // for external use only
}


/**
 * This type is to allow the user to customize all available options for a specific entry
 * in the list, allowing for unique entries with their own CSS, reorder descriptions, data,
 * and component while still being reorderable within the list. The ReorderableList expects
 * all entries to be formatted with this data type.
 * 
 * Usage:
 *   ```
 *   ...
 *   const entries:ReorderableEntry<T> = [{
 *       data: {name: "MyFancyItem", version: 3}
 *       component: MyFancyComponent
 *     },
 *     {...}
 *   ]
 *   return (<ReorderableList<T> entries={entries} onListUpdate={onListUpdate}/>)
 *   ```
 * 
 */
export type ReorderableEntry<T> = IReorderableEntry<T> & IReorderableEntryExtendedProps









export function ReorderableList<T>(props: ReorderableListProps<T>) {
  const {entries, onListUpdate} = props
  const onShiftPosition = (position: number, offset: number) => {
    let newOrder = [...reorderableItems]
    if (offset < 0 && Math.abs(offset) > position) { offset = -position }
    if (offset > 0 && offset+position > newOrder.length-1) { offset = (newOrder.length-1) - position }
    if (offset == 0) return
    [newOrder[position], newOrder[position+offset]] = [newOrder[position+offset], newOrder[position]]
    setReorderableItems(newOrder)
  }
  const onSecondaryAction = (position: number, selected: boolean) => {
    let newOrder = [...reorderableItems]
    newOrder[position].selected = !selected
    setReorderableItems(newOrder)
    if (selected) {
      // Signal for updating only on user deselect
      onListUpdate(newOrder.map(entry => entry.data))
    }
  }
  const onUnfocus = () => {
    // entries is empty on mutation for some reason
    //let newOrder = [...reorderableEntriesRef.current]
    let newOrder = [...reorderableItems]
    newOrder.forEach(x => x.selected = false)
    setReorderableItems(newOrder)
  }
  const toReorderableItems:(entries: ReorderableEntry<T>[]) => IReorderableItemProps<T>[] = (entries) => entries.map((entry, idx) => ({
    ...(props as IReorderableListExtendedProps),
    ...(entry as IReorderableEntryExtendedProps),
    data: entry.data,
    component: entry.component,
    selected: false,
    position: idx,
    reorderActive: false,
    onShiftPosition,
    onSecondaryAction,
    onUnfocus
  }))
  const [reorderableItems, setReorderableItems] = useState<IReorderableItemProps<T>[]>(toReorderableItems(entries))

  useEffect(()=>{
    console.log(`Entries have been updated, refreshing ReorderableItems`)
    setReorderableItems(toReorderableItems(entries))
  },[entries])

  return (
    <>
      {
        reorderableItems.map((item)=>{
          <ReorderableItem<T> {...item}>
            <item.component {...(item as ReorderableEntryProps<T>)} />
          </ReorderableItem>
        })
      }
    </>
  )
}


function ReorderableItem<T>(props: IReorderableItemProps<T>) {
  let {animate, activeCSS, inactiveCSS, defaultCSS, onSecondaryActionDescriptionActive, onSecondaryActionDescriptionInactive, fieldProps} = props
  const {onShiftPosition, onSecondaryAction, onUnfocus, selected, position, reorderActive} = props
  const onButton = (event: GamepadEvent) => {
    if (event.detail.button == GamepadButton.DIR_UP) { onShiftPosition(position, -1) }
    else if (event.detail.button == GamepadButton.DIR_DOWN) { onShiftPosition(position, 1) }
    else if (event.detail.button == GamepadButton.CANCEL && reorderActive) { onUnfocus() }
  }
  // Coalesce undefined values
  animate = animate ?? true
  activeCSS = activeCSS ?? ReorderableItemActiveCSS
  inactiveCSS = inactiveCSS ?? ReorderableItemInactiveCSS
  defaultCSS = defaultCSS ?? ReorderableItemNoDefaultCSS
  onSecondaryActionDescriptionActive = onSecondaryActionDescriptionActive ?? 'Save order'
  onSecondaryActionDescriptionInactive = onSecondaryActionDescriptionInactive ?? 'Reorder'

  return (
    <div style={reorderActive && animate ? (selected ? activeCSS : inactiveCSS) : defaultCSS}>
      <Field
        bottomSeparator="none"
        childrenLayout="below"
        spacingBetweenLabelAndChild="none"
        padding="none"
        {...fieldProps}
        focusable={reorderActive}
        onSecondaryButton={()=>onSecondaryAction(position, selected)}
        onSecondaryActionDescription={reorderActive ? onSecondaryActionDescriptionActive : onSecondaryActionDescriptionInactive}
        onButtonDown={(event) => {selected ? onButton(event): undefined}}>
          {props.children}
      </Field>
    </div>
  )
}


const ReorderableItemActiveCSS: CSSProperties = {
  backgroundColor: '#885588',
  transition: '500ms ease'
}
const ReorderableItemInactiveCSS: CSSProperties = {
  transform: 'scale(0.9)',
  transition: '500ms ease'
}
const ReorderableItemNoDefaultCSS: CSSProperties = {
  transform: 'scale(1)',
  transition: '200ms ease'
}







interface MyFancyData {
  name: string
  version: number
}

var reorderableEntry1: ReorderableEntry<MyFancyData> = {
  data: {name: "something", version: 3},
  component: MyFancyComponent,
  activeCSS: {backgroundColor:"crimson"}
}
var reorderableEntry2: ReorderableEntry<MyFancyData> = {
  data: {name: "new", version: 2},
  component: MyFancyComponent,
  activeCSS: {backgroundColor:"azure"}
}
var reorderableEntry3: ReorderableEntry<MyFancyData> = {
  data: {name: "here", version: 1},
  component: MyFancyComponent,
  activeCSS: {backgroundColor: "seagreen"}
}

function MyFancyComponent(props: ReorderableEntryProps<MyFancyData>) {
  return (
    <div>
      {props.data.name} {props.selected} {props.reorderActive}
    </div>
  )
}

function MyMainComponent() {
  const [entries, setEntries] = useState([reorderableEntry1, reorderableEntry2, reorderableEntry3])
  const onListUpdate = (entries: MyFancyData[]) => {
    setEntries((prev) => prev.sort((a,b) => entries.indexOf(a.data) - entries.indexOf(b.data)) )
  }
  
  return (
    <ReorderableList<MyFancyData> entries={entries} onListUpdate={onListUpdate}/>
  )
}
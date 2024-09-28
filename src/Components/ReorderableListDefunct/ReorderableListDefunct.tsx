import { Focusable, GamepadButton, GamepadEvent, Field } from "@decky/ui"
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react"

export interface ReorderableListProps<T> {
  entries: ReorderableItem<T>[]
  onListUpdate: (newEntries: T[]) => void
  selectedCSS?: CSSProperties // CSS for the selected element
  unSelectedCSS?: CSSProperties // CSS for the unselected elements
  noSelectedCSS?: CSSProperties // CSS for the list without selected
  onSecondaryActionDescription?: string // Override for secondary action description
}
export interface ReorderableItem<T> {
  data: T
  component: JSX.Element
  label?: ReactNode
  focusable?: boolean
}
interface ReorderableEntryData<T> extends ReorderableItem<T> {
  selected: boolean
  position: number
}
export function ReorderableList<T>(props: ReorderableListProps<T>) {
  const {entries, onListUpdate, selectedCSS, unSelectedCSS, noSelectedCSS, onSecondaryActionDescription} = props
  const updateOrder = (newOrder: ReorderableEntryData<T>[]) => {
    onListUpdate(newOrder.map(entry => entry.data))
  }
  const onShiftPosition = (position: number, offset: number) => {
    let newOrder = [...reorderableEntries]
    if (offset < 0 && Math.abs(offset) > position) { offset = -position }
    if (offset > 0 && offset+position > newOrder.length-1) { offset = (newOrder.length-1) - position }
    if (offset == 0) return
    [newOrder[position], newOrder[position+offset]] = [newOrder[position+offset], newOrder[position]]
    setReorderableEntries(newOrder)
  }
  const onSecondaryAction = (position: number, selected: boolean) => {
    let newOrder = [...reorderableEntries]
    newOrder[position].selected = !selected
    setReorderableEntries(newOrder)
    if (selected) {
      // Signal for updating only on user deselect
      updateOrder(newOrder)
    }
  }
  const onUnfocus = () => {
    // entries is empty on mutation for some reason
    let newOrder = [...reorderableEntriesRef.current]
    newOrder.forEach(x => x.selected = false)
    setReorderableEntries(newOrder)
  }
  const toReorderableEntries = (entries: ReorderableItem<T>[]) => entries.map((entry, idx) => ({
    data: entry.data,
    component: entry.component,
    label: entry.label,
    focusable: entry.focusable,
    selected: false,
    position: idx
  }))
  const [reorderableEntries, setReorderableEntries] = useState<ReorderableEntryData<T>[]>(toReorderableEntries(entries))
  const reorderableEntriesRef = useRef(reorderableEntries)

  // Use mutation observer to monitor Reorderable List for gpfocuswithin class changes and deselect items when focus is lost
  const listRef = useRef(null)
  const observer = new MutationObserver( async () => {
    // @ts-expect-error -- listRef has no type hinting, so linter assumes listRef.current.className doesn't exist on type `never`
    if (listRef.current && !listRef.current.className.includes(`gpfocuswithin`) && reorderableEntriesRef.current.some(x=>x.selected)) {
      onUnfocus()
    }
  })
  useEffect(() => {
    console.log(`Initialize ReorderableList`)
    if (listRef.current) {
      observer.observe(listRef.current, {attributes: true})
    }
    return () => {
      console.log(`Deinitialize ReorderableList`)
      observer.disconnect()
    }
  },[])
  useEffect(()=>setReorderableEntries(()=>{
    let reorderableEntries = toReorderableEntries(entries)
    reorderableEntriesRef.current = reorderableEntries
    return reorderableEntries
  }),[entries])

  return (
    <Focusable
      ref={listRef}
      style={{flexDirection:"column"}}>
      {reorderableEntries.map((child, idx) =>{ return (
        <ReorderableItem
          selected={child.selected}
          position={idx}
          // label={child.label}
          focusable={child.focusable}
          reorderActive={reorderableEntries.some(x=>x.selected)}
          onShiftPosition={onShiftPosition}
          onSecondaryAction={onSecondaryAction}
          onUnfocus={onUnfocus}
          onSecondaryActionDescription={onSecondaryActionDescription}
          selectedCSS={selectedCSS}
          unSelectedCSS={unSelectedCSS}
          noSelectedCSS={noSelectedCSS}
          >{child.component}</ReorderableItem>
      )})}
    </Focusable>
  )
}

interface ReorderableItemProps {
  selected: boolean
  position: number
  // label?: ReactNode
  focusable?: boolean
  reorderActive: boolean
  onShiftPosition: (position:number, offset: number) => void
  onSecondaryAction: (position:number, selected: boolean) => void
  onUnfocus: () => void
  selectedCSS?: CSSProperties
  unSelectedCSS?: CSSProperties
  noSelectedCSS?: CSSProperties
  onSecondaryActionDescription?: string
  children?:any
}
function ReorderableItem(props: ReorderableItemProps){
  useEffect(() => {
    console.log(`Initialize ReorderableItem`)
    return () => {console.log(`Deinitialize ReorderableItem`)}
  },[])
  const selectedCSS = props.selectedCSS ?? ReorderableItemSelectedCSS
  const unSelectedCSS = props.unSelectedCSS ?? ReorderableItemUnselectedCSS
  const noSelectedCSS = props.noSelectedCSS ?? ReorderableItemNoSelectedCSS
  const onSecondaryButton = () => {
    props.onSecondaryAction(props.position, props.selected)
  }
  const onButton = (event: GamepadEvent) => {
    if (event.detail.button == GamepadButton.DIR_UP) { props.onShiftPosition(props.position, -1) }
    else if (event.detail.button == GamepadButton.DIR_DOWN) { props.onShiftPosition(props.position, 1) }
    else if (event.detail.button == GamepadButton.CANCEL && props.reorderActive) { props.onUnfocus() }
  }
  return (
    <div 
      style={ props.reorderActive ? (props.selected ? selectedCSS : unSelectedCSS) : noSelectedCSS }>
      <Field
        focusable={props.focusable ? true : false}
        bottomSeparator="none"
        childrenLayout="below"
        spacingBetweenLabelAndChild="none"
        padding="none"
        onSecondaryButton={onSecondaryButton}
        onSecondaryActionDescription={props.onSecondaryActionDescription ?? `Reorder`}
        onButtonDown={(event) => {props.selected ? onButton(event): undefined}}>
          {props.children}
      </Field>
    </div>
  )
}

const ReorderableItemSelectedCSS: CSSProperties = {
  backgroundColor: '#885588',
  transition: '500ms ease'
}
const ReorderableItemUnselectedCSS: CSSProperties = {
  transform: 'scale(0.9)',
  transition: '500ms ease'
}
const ReorderableItemNoSelectedCSS: CSSProperties = {
  transform: 'scale(1)',
  transition: '200ms ease'
}
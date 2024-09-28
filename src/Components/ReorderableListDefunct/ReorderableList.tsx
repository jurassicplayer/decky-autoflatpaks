import { Focusable } from "@decky/ui"
import { ReactNode, useRef, useEffect, useState } from "react"
import { IROListEntry, IROListItem, ROListItem } from "./ReorderableItem"

interface IROListProps<T,K> {
  entries: IROListItem<T,K>[]
  onListUpdate: (newEntries: T[])=>void
  onSecondaryActionDescription?: string
  children?: ReactNode
}

export function ROList<T,K extends JSX.IntrinsicAttributes>(props: IROListProps<T,K>) {
  const {entries, onListUpdate, onSecondaryActionDescription} = props
  const [reorderableEntries, setReorderableEntries] = useState<IROListEntry<T,K>[]>(entries.map(
    (entry) => {
      let reorderableEntry = {
        ...entry,
        selected: false
      }
      return reorderableEntry
    }
  ))
  const listRef = useRef(null)
  const updateOrder = (entries: IROListItem<T,K>[]) => {
    onListUpdate(entries.map(entry => entry.entryData))
  }
  const onShiftPosition = (position: number, offset: number) => {
    let newOrder = [...reorderableEntries]
    if (offset < 0 && Math.abs(offset) > position) { offset = -position }
    if (offset > 0 && offset+position > newOrder.length-1) { offset = (newOrder.length-1) - position }
    if (offset == 0) return
    [newOrder[position], newOrder[position+offset]] = [newOrder[position+offset], newOrder[position]]
    updateOrder(newOrder)
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
    let newOrder = [...reorderableEntries]
    newOrder.forEach(x => x.selected = false)
    setReorderableEntries(newOrder)
  }
  const observer = new MutationObserver( async () => {
    // @ts-expect-error -- listRef has no type hinting, so linter assumes listRef.current.className doesn't exist on type `never`
    if (listRef.current && !listRef.current.className.includes(`gpfocuswithin`) && reorderableEntries.some(x=>x.selected)) {
      onUnfocus()
    }
  })
  useEffect(() => {
    console.log(`Initialize ReorderableList`)
    if (listRef.current) { observer.observe(listRef.current, {attributes: true}) }
    return () => {
      console.log(`Deinitialize ReorderableList`)
      observer.disconnect()
    }
  },[])
  useEffect(()=>{ console.log(`Entries have been changed` )},[entries])
  return (
    <Focusable
      ref={listRef}>
      {reorderableEntries.map((entry, idx) => 
        <ROListItem
          position={idx}
          selected={entry.selected}
          reorderActive={reorderableEntries.some(x=>x.selected)}
          onShiftPosition={onShiftPosition}
          onSecondaryAction={onSecondaryAction}
          onUnfocus={onUnfocus}
          onSecondaryActionDescription={onSecondaryActionDescription}>
          <entry.component {...entry.componentData} />
        </ROListItem>)}
    </Focusable>
  )
}
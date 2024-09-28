import { Field, Focusable, GamepadButton, GamepadEvent } from "@decky/ui"
import { CSSProperties, ReactNode, useEffect } from "react"

export interface IROListItem<T,K> {
  entryData: T
  component: (props: K) => JSX.Element
  componentData: K
  focusable?: boolean
}

export interface IROListEntry<T,K> extends IROListItem<T,K> {
  selected: boolean
}

export interface IROListItemProps {
  position: number
  selected: boolean
  reorderActive: boolean
  onShiftPosition: (position: number, offset: number) => void
  onSecondaryAction: (position: number, selected: boolean) => void
  onUnfocus: () => void
  label?: ReactNode
  focusable?: boolean
  selectedCSS?: CSSProperties
  unSelectedCSS?: CSSProperties
  noSelectedCSS?: CSSProperties
  onSecondaryActionDescription?: string
  children?:any
}

export function ROListItem(props: IROListItemProps) {
  const { children, selected, position, label, focusable, reorderActive, onShiftPosition, onSecondaryAction, onUnfocus, onSecondaryActionDescription } = props
  useEffect(() => {
    console.log(`Initialize ReorderableItem`)
    return () => {
      console.log(`Deinitialize ReorderableItem`)
    }
  },[])
  const selectedCSS = props.selectedCSS ?? ReorderableItemSelectedCSS
  const unSelectedCSS = props.unSelectedCSS?? ReorderableItemUnselectedCSS
  const noSelectedCSS = props.noSelectedCSS ?? ReorderableItemNoSelectedCSS
  const onSecondaryButton = () => {
    onSecondaryAction(position, selected)
  }
  const onButton = (event: GamepadEvent) => {
    if (event.detail.button == GamepadButton.DIR_UP) { onShiftPosition(position, -1) }
    else if (event.detail.button == GamepadButton.DIR_DOWN) { onShiftPosition(position, 1) }
    else if (event.detail.button == GamepadButton.CANCEL && reorderActive) { onUnfocus() }
  }
  return (
    <Focusable 
      style={ reorderActive ? (selected ? selectedCSS : unSelectedCSS) : noSelectedCSS }>
      <Field
        label={label}
        focusable={focusable ? true : false}
        onSecondaryButton={onSecondaryButton}
        onSecondaryActionDescription={onSecondaryActionDescription ?? `Reorder`}
        onButtonDown={(event) => {selected ? onButton(event): undefined}}>
          {children}
      </Field>
    </Focusable>
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
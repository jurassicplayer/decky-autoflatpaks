import { CSSProperties, JSXElementConstructor, ReactNode, useRef, useState } from "react"
import { Field, FieldProps, Focusable, GamepadButton, GamepadEvent } from "@decky/ui"

export interface ReorderableExtendedProps {
  activeCSS?: CSSProperties;
  inactiveCSS?: CSSProperties;
  defaultCSS?: CSSProperties;
  fieldProps?: FieldProps;
}
/**
 * A ReorderableList entry of type <T>.
 * @param label Optional name of this entry in the list.
 * @param data Optional data to connect to this entry.
 * @param position The position of this entry in the list.
 * @param component Optional component to connect to this entry.
 * @param activeCSS Optional css for this entry while selected in reordering mode.
 * @param inactiveCSS Optional css for this entry while NOT selected in reordering mode.
 * @param defaultCSS Optional css for this entry while NOT in reordering mode.
 * @param fieldProps Optional properties for Field component encapsulating this entry.
 */
export type ReorderableEntry<T> = ReorderableExtendedProps & {
  label?: ReactNode;
  data?: T;
  position: number;
  component?: JSXElementConstructor<{ entry: ReorderableEntry<T> }>;
}



/**
 * Properties for a ReorderableItem component of type <T>
 */
type ReorderableListEntryProps<T> = ReorderableExtendedProps & {
  onShiftPosition: (entryData: ReorderableEntry<T>, offset: number) => void
  entryData: ReorderableEntry<T>;
  reorderEnabled: boolean;
  animate: boolean;
  disabled: boolean;
};

export function ReorderableItem<T>(props: ReorderableListEntryProps<T>) {
  const [isSelected, setIsSelected] = useState<boolean>(false)
  const fieldProps = props.fieldProps ?? DefaultFieldProps
  const animate = props.animate ?? true
  const activeCSS = props.activeCSS ?? ReorderableItemActiveCSS
  const inactiveCSS = props.inactiveCSS ?? ReorderableItemInactiveCSS
  const defaultCSS = props.defaultCSS ?? ReorderableItemDefaultCSS
  const itemRef = useRef<SteamElement>(null)

  function onButton(event: GamepadEvent): void {
    if (itemRef.current && event.detail.button == GamepadButton.SECONDARY){
      if (props.reorderEnabled){
        let previousFocusableIfNoChildren = itemRef.current.m_node.m_Properties.focusableIfNoChildren
        let previousChildFocusDisabled = itemRef.current.m_node.m_Properties.childFocusDisabled
        itemRef.current.m_node.m_Properties.focusableIfNoChildren = true
        itemRef.current.m_node.m_Properties.childFocusDisabled = true
        itemRef.current.m_node.BTakeFocus()
        itemRef.current.m_node.m_Properties.focusableIfNoChildren = previousFocusableIfNoChildren
        itemRef.current.m_node.m_Properties.childFocusDisabled = previousChildFocusDisabled
      } else {
        itemRef.current.m_node.BChildTakeFocus()
      }
    }
    if (!props.reorderEnabled) return;

    if (event.detail.button == GamepadButton.DIR_UP) { props.onShiftPosition(props.entryData, -1) }
    else if (event.detail.button == GamepadButton.DIR_DOWN) { props.onShiftPosition(props.entryData, 1) } 
  }

  return (
    <div style={ animate && props.reorderEnabled ? (isSelected ? activeCSS : inactiveCSS) : defaultCSS }>
      <Field
        {...fieldProps}
        // @ts-expect-error navRef not defined in props yet
        navRef={itemRef}
        label={props.entryData.label}
        focusable={props.reorderEnabled}
        onButtonDown={props.disabled ? onButton:undefined}
        onGamepadBlur={() => setIsSelected(false)}
        onGamepadFocus={() => setIsSelected(true)}
      >
        <Focusable style={{ display: 'flex', width: '100%', position: 'relative' }}>
          {props.entryData.component ? <props.entryData.component entry={props.entryData} /> : null}
        </Focusable>
      </Field>
    </div>
  );
}

const ReorderableItemDefaultCSS: CSSProperties = {
  transform: 'scale(1)',
  transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
  opacity: 1
}
const ReorderableItemActiveCSS: CSSProperties = {
  ...ReorderableItemDefaultCSS
}
const ReorderableItemInactiveCSS: CSSProperties = {
  ...ReorderableItemDefaultCSS,
  transform: 'scale(0.9)',
  opacity: 0.7
}

export const MultiRowComponentFieldProps: FieldProps = {
  bottomSeparator: "none",
  childrenLayout: "below",
  padding: "none",
}
const DefaultFieldProps: FieldProps = {
  bottomSeparator: "standard",
  childrenLayout: "inline",
  padding: "standard"
}


// Might want to add this to ../globals/SteamClient or some other name at some point
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
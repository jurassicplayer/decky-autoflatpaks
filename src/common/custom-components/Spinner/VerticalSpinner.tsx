import { Focusable, DialogButton, NavEntryPositionPreferences, Button, GamepadEvent, GamepadButton } from "@decky/ui"
import { CSSProperties, useState } from "react"
import { FaArrowUp, FaArrowDown } from "react-icons/fa"
import { flexColumn } from "../../styles.css"
import { VerticalSpinnerProps } from "./Spinner.d"

const ArrowButtonFocusableStyle:CSSProperties = {
  ...flexColumn,
  rowGap: "0.2rem",
  display: "inline-flex"
}
const ArrowButtonLabelStyle:CSSProperties = {
  textAlign:"center"
}
const ArrowButtonStyle:CSSProperties = {
  minWidth: "0px",
  maxWidth: "0px",
  padding: "0.1rem 1.5rem"
}
const ArrowIconStyle:CSSProperties = {
  marginTop: "0.15rem",
  marginLeft: "-0.5rem"
}

export function VerticalSpinner(props: VerticalSpinnerProps) {
  const {label, value, disabled, onChange,
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER
  } = props
  const [editable, setEditable] = useState<boolean>(false)

  const setClampedValue = (newValue: number) => {
    const clamped = Math.min(max, Math.max(min, newValue))
    if (onChange) onChange(clamped)
  }
  const onClickUp = ()=>setClampedValue(value+1)
  const onClickDown = ()=>setClampedValue(value-1)
  const onKeyDown = (e:GamepadEvent) => {
    if (!editable) return
    switch (e.detail.button){
      case GamepadButton.DIR_UP:
        e.stopPropagation()
        onClickUp()
        break
      case GamepadButton.DIR_DOWN:
        e.stopPropagation()
        onClickDown()
        break
      default:
        setEditable(false)
    }
  }

  return (
    <Focusable
      style={ArrowButtonFocusableStyle}
      navEntryPreferPosition={NavEntryPositionPreferences.MAINTAIN_Y}
      onOptionsActionDescription={editable ? "Done":"Edit Value"}
      onOptionsButton={()=>setEditable(!editable)}
    >
      <div style={ArrowButtonLabelStyle}>{label}</div>
      <DialogButton
        focusable={false}
        disabled={disabled?disabled:!editable}
        style={ArrowButtonStyle}
        onClick={onClickUp}>
        <FaArrowUp style={ArrowIconStyle}/>
      </DialogButton>
      <Button
        focusable={true}
        disabled={disabled}
        onButtonDown={onKeyDown}>
        {value}
      </Button>
      <DialogButton
        focusable={false}
        disabled={disabled?disabled:!editable}
        style={ArrowButtonStyle}
        onClick={onClickDown}>
        <FaArrowDown style={ArrowIconStyle}/>
      </DialogButton>
    </Focusable>
  )
}

export default VerticalSpinner
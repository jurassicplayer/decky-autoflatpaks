import { Focusable, DialogButton, NavEntryPositionPreferences } from "@decky/ui"
import { CSSProperties } from "react"
import { FaArrowUp, FaArrowDown } from "react-icons/fa"
import { bottomSeparatorStyle, flexColumn, flexRow } from "../../styles.css"
import { HorizontalSpinnerProps } from "./Spinner.d"

const ArrowButtonFocusableStyle:CSSProperties = {
  ...flexRow,
  maxHeight: "25px",
  display: "inline-flex"
}
const ArrowButtonStyle:CSSProperties = {
  minWidth: "0px",
  maxWidth: "0px",
  padding: "10px 16px",
  marginRight: "1px"
}
const ArrowIconStyle:CSSProperties = {
  verticalAlign: "top",
  marginTop: "-5px",
  marginLeft: "-8px"
}
const SpinnerRowStyle:CSSProperties = {
  ...flexRow,
  justifyContent: "space-between",
  marginTop: "2px",
  marginInlineStart:"calc(var(--indent-level)* 18px)",
}
const DescriptionStyle:CSSProperties = {
  fontSize:"0.75rem",
  marginTop: "0.5rem"
}

export function HorizontalSpinner(props: HorizontalSpinnerProps) {
  const {label, value, description, disabled, onChange,
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    bottomSeparator = "standard",
    indentLevel = 0
  } = props

  const setClampedValue = (newValue: number) => {
    const clamped = Math.min(max, Math.max(min, newValue))
    if (onChange) onChange(clamped)
  }
  const onClickUp = ()=>setClampedValue(value+1)
  const onClickDown = ()=>setClampedValue(value-1)

  return (
    //@ts-ignore --indent-level warning
    <div style={{...SpinnerRowStyle, '--indent-level': indentLevel, ...bottomSeparatorStyle[bottomSeparator]}}>
      <div style={flexColumn}>
        <div>{label}</div>
        <div style={DescriptionStyle}>{description}</div>
      </div>
      <div>{value}</div>
      <Focusable style={ArrowButtonFocusableStyle} navEntryPreferPosition={NavEntryPositionPreferences.MAINTAIN_X}>
        <DialogButton
          disabled={disabled}
          style={ArrowButtonStyle}
          onClick={onClickUp}>
          <FaArrowUp style={ArrowIconStyle}/>
        </DialogButton>
        <DialogButton
          disabled={disabled}
          style={ArrowButtonStyle}
          onClick={onClickDown}>
          <FaArrowDown style={ArrowIconStyle}/>
        </DialogButton>
      </Focusable>
    </div>
  )
}

export default HorizontalSpinner
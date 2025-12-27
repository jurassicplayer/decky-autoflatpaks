import { Focusable } from "@decky/ui"
import { CSSProperties } from "react"
import VerticalSpinner from "./VerticalSpinner"
import { bottomSeparatorStyle, flexColumn, flexRow } from "../../styles.css"
import { mergeMinutes, splitMinutes } from "../../utils"
import { DayHourMinuteSpinnerProps } from "./Spinner.d"

const SpinnerFocusableStyle:CSSProperties = {
  ...flexRow,
  justifyContent:"flex-end",
  columnGap:"0.25rem"
}
const SpinnerRowStyle:CSSProperties = {
  ...flexRow,
  justifyContent:"space-between",
  padding:"0.625rem 0px",
  marginInlineStart: "calc(var(--indent-level)* 18px)"
}
const DescriptionStyle:CSSProperties = {
  fontSize:"0.75rem",
  marginTop: "0.5rem"
}

export function DayHourMinuteSpinner(props: DayHourMinuteSpinnerProps) {
  const {label, value, description, disabled, onChange,
    bottomSeparator = "standard",
    indentLevel = 0
  } = props
  const onSpinnerChange = (type: "days"|"hours"|"minutes", newValue:number) => {
    let days = type === "days" ? newValue : splitMinutes(value).days
    let hours = type === "hours" ? newValue : splitMinutes(value).hours
    let minutes = type === "minutes" ? newValue : splitMinutes(value).minutes
    if (onChange) onChange(mergeMinutes(days, hours, minutes))
  }
  return (
    <div style={{...SpinnerRowStyle, '--indent-level': indentLevel, ...bottomSeparatorStyle[bottomSeparator]}}>
            <div style={flexColumn}>
              <div>{label}</div>
              <div style={DescriptionStyle}>{description}</div>
            </div>
            <Focusable style={SpinnerFocusableStyle} >
              <VerticalSpinner
                label="DAY"
                value={splitMinutes(value).days}
                onChange={(value)=>onSpinnerChange('days', value)}
                min={0}
                disabled={disabled}
              />
              <VerticalSpinner
                label="HRS"
                value={splitMinutes(value).hours}
                onChange={(value)=>onSpinnerChange('hours', value)}
                min={0}
                max={23}
                disabled={disabled}
              />
              <VerticalSpinner
                label="MIN"
                value={splitMinutes(value).minutes}
                onChange={(value)=>onSpinnerChange('minutes', value)}
                min={0}
                max={59}
                disabled={disabled}
              />
            </Focusable>
          </div>
  )
}

export default DayHourMinuteSpinner
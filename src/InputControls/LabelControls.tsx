import { DialogButton, DialogButtonProps, Focusable, staticClasses, Toggle, ToggleProps } from "decky-frontend-lib"
import { CSSProperties, FC } from "react"

interface LabelControlProps {
  label?: React.ReactNode
  description?: React.ReactNode
}

const RowContainer: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  minHeight: "3em"
}
const LabelContainer: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  flexGrow: 1
}

export const LabelButton: FC<DialogButtonProps & LabelControlProps> = (props) => {
  return (
    <Focusable
      style={RowContainer}>
      <div style={LabelContainer}>
        <div className={staticClasses.Text}>{props.label}</div>
        <div className={staticClasses.Label}>{props.description}</div>
      </div>
      <DialogButton
        {...props}
        style={{margin:"4px", width: "auto", minWidth: "70px", ...props.style}}>{props.children}
      </DialogButton>
    </Focusable>
  )}

export const LabelToggle: FC<ToggleProps & LabelControlProps> = (props) => {
  return (
    <Focusable
      style={RowContainer}>
      <div style={LabelContainer}>
        <div className={staticClasses.Text}>{props.label}</div>
        <div className={staticClasses.Label}>{props.description}</div>
      </div>
      <div style={{margin:"auto"}}><Toggle {...props} /></div>
    </Focusable>
  )}
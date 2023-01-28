import { DialogButton, DialogButtonProps, Focusable, staticClasses, Toggle, ToggleProps } from "decky-frontend-lib"
import { CSSProperties, FC } from "react"

interface LabelControlProps {
  label?: React.ReactNode
  description?: React.ReactNode
}

export const RowContainer: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  minHeight: "3em"
}
export const LabelContainer: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-evenly",
  flexGrow: 1
}
export const ButtonStyle: CSSProperties = {
  margin:"4px",
  width: "auto",
  minWidth: "70px"
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
        style={{...ButtonStyle, ...props.style}}>{props.children}
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
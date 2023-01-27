import { DialogButton, DialogButtonProps, Focusable, staticClasses } from "decky-frontend-lib"
import { FC } from "react"

interface LabelButtonProps {
  label?: React.ReactNode
  description?: React.ReactNode
}

export const LabelButton: FC<DialogButtonProps & LabelButtonProps> = (props) => {
  return (
    <Focusable
      style={{
        display: "flex",
        flexDirection: "row"
      }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1
        }}>
        <div className={staticClasses.Text}>{props.label}</div>
        <div className={staticClasses.Label}>{props.description}</div>
      </div>
      <DialogButton
        {...props}
        style={{margin:"4px", width: "auto", minWidth: "70px", ...props.style}}>{props.children}
      </DialogButton>
    </Focusable>
  )}
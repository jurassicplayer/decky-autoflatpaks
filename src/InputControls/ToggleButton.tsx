import { DialogButton, DialogButtonProps } from "decky-frontend-lib"
import { CSSProperties } from "react"
import { Card } from "../FlatpakManager/Browse/FlatpakCard.css"


export interface ToggleButtonProps extends DialogButtonProps {
  value?: boolean
  toggledCSS?: CSSProperties
  untoggledCSS?: CSSProperties
}

export const ToggleButton: React.FC<DialogButtonProps & ToggleButtonProps> = ({
  ...props
}) => {
  if (props.toggledCSS == undefined) props.toggledCSS = Card.mask
  if (props.untoggledCSS == undefined) props.untoggledCSS = Card.mask
  return (
    <DialogButton
      {...props}
      onClick={e => {
        props.value = !props.value
        props.onClick?.(e)
      }}
      style={ props.value ? props.toggledCSS : props.untoggledCSS }
      >
      {props.children}
    </DialogButton>
  )
}

export default ToggleButton
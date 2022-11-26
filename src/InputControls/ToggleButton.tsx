import { DialogButton, DialogButtonProps } from "decky-frontend-lib"
import { useState, CSSProperties } from "react"
import { Card } from "../FlatpakManager/BrowsePage.css"


export interface ToggleButtonProps extends DialogButtonProps {
  value?: boolean
  toggledCSS?: CSSProperties
  untoggledCSS?: CSSProperties
}

export const ToggleButton: React.FC<DialogButtonProps & ToggleButtonProps> = ({
  ...props
}) => {
  const [value, setValue] = useState<boolean>(props.value ? props.value : false)
  if (props.toggledCSS == undefined) props.toggledCSS = Card.mask
  if (props.untoggledCSS == undefined) props.untoggledCSS = Card.mask
  return (
    <DialogButton
      {...props}    
      onClick={e => {
        setValue(!value)
        props.onClick?.(e)
      }}
      style={ value ? props.toggledCSS : props.untoggledCSS }
      >
      {props.children}
    </DialogButton>
  )
}

export default ToggleButton
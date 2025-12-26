import { DialogBodyText as DeckyDialogBodyText, DialogCommonProps } from "@decky/ui"
import { CSSProperties, FC } from "react"

const dialogBodyTextStyling:CSSProperties = {
  fontSize: "0.75rem"
}

export const DialogBodyText:FC<DialogCommonProps> = (props) => {
  const mergedStyle:CSSProperties = props.style ? {...props.style, ...dialogBodyTextStyling} : dialogBodyTextStyling
  return(
    <DeckyDialogBodyText {...props} style={mergedStyle}/>
  )
}

const ModifiedDeckyUI = {
  DialogBodyText
}
export default ModifiedDeckyUI
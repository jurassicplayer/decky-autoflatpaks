import { DialogBodyText as DeckyDialogBodyText, DialogCommonProps } from "@decky/ui"
import { CSSProperties, FC } from "react"

const DialogBodyTextStyling:CSSProperties = {
  fontSize: "0.75rem"
}

export const DialogBodyText:FC<DialogCommonProps> = (props) => {
  if (props.style !== undefined) props.style = {...props.style, ...DialogBodyTextStyling}
  return(
    <DeckyDialogBodyText style={DialogBodyTextStyling} {...props}/>
  )
}


// Replace the original export directly
const ModifiedDeckyUI = {
  DialogBodyText
}
export default ModifiedDeckyUI
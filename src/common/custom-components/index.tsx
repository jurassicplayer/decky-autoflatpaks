import { DialogBodyText as DeckyDialogBodyText, DialogCommonProps } from "@decky/ui"
import { CSSProperties, FC } from "react"

//#region Modified DeckyUI
//#region CSSProperties
const dialogBodyTextStyling:CSSProperties = {
  fontSize: "0.75rem"
}
//#endregion

//#region Function Component
export const DialogBodyText:FC<DialogCommonProps> = (props) => {
  const mergedStyle:CSSProperties = props.style ? {...props.style, ...dialogBodyTextStyling} : dialogBodyTextStyling
  return(
    <DeckyDialogBodyText {...props} style={mergedStyle}/>
  )
}
//#endregion
//#endregion

//#region Export custom components
export * from './Spinner'
//#endregion
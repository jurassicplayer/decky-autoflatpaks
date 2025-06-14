import { Focusable } from "@decky/ui";
import { CSSProperties } from "react";

export function FlexGrowDiv(props:any) {
  let style:CSSProperties = props.style
  return (
    <div {...props} style={{...style, flexGrow: 1}}/>
  )
}

export function FlexGrowFocusable(props:any) {
  let style:CSSProperties = props.style
  return (
    <Focusable {...props} style={{...style, flexGrow: 1}}/>
  )
}
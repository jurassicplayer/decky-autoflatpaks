import { CSSProperties } from "react";

export const FlexRow:CSSProperties= {
  display: "flex",
  flexDirection:"row",
  alignItems: "center"
}
export const ButtonCSS:CSSProperties = {
  minWidth: "0px",
  width: "10ex",
  marginLeft: "1ex"
}
export const HalfButton:CSSProperties = {
  ...ButtonCSS,
  width: "5ex",
  padding: "1ex"
}
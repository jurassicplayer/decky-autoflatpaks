import { CSSProperties } from "react"

export const flex:CSSProperties = {
  display: "flex"
}
export const flexRow:CSSProperties = {
  ...flex,
  flexDirection: "row"
}
export const flexColumn:CSSProperties = {
  ...flex,
  flexDirection: "column"
}
export const flexSplitScreen:CSSProperties = {
  ...flexColumn,
  flex: 1,
  alignItems: "center",
  marginLeft: "0.25em",
  marginRight: "0.25em"
}
export const cardStyle:CSSProperties = {
  borderRadius: '1em',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
}
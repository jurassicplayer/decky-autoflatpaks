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

export const bottomSeparatorStyle:{[key:string]:CSSProperties} = {
  "thick": {
    borderWidth: "0px 0px 1.5px 0px",
    borderColor:"rgba(255, 255, 255, 0.1)",
    borderStyle:"solid"
  },
  "standard": {
    borderWidth: "0px 0px 1.5px 0px",
    borderColor:"rgba(255, 255, 255, 0.1)",
    borderStyle:"solid"
  },
  "none": {
    borderWidth: "0px 0px 0px 0px"
  }
}
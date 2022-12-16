import { CSSProperties } from "react";

const CardInfoBase: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  overflow: "scroll",
  whiteSpace: "nowrap",
  color: "white",
  padding: "0px"
}

export const CardInfo: {[key: string]: CSSProperties} = {
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    minWidth: "100%"
  },
  focus: {
    ...CardInfoBase,
    backgroundColor: "#4b6e90" //"#1f2933"
  },
  blur: {
    ...CardInfoBase,
    backgroundColor: "#121c25"
  }
}

const CardButtonBase = {
  minWidth: '60px',
  maxWidth: "0px",
  margin: "2px",
  padding: "10px 10px"
}

export const CardButton: {[key: string]: CSSProperties} = {
maskToggled: {
  ...CardButtonBase,
  backgroundColor: "#9c8f40"
},
mask: {
  ...CardButtonBase
},
install: {
  ...CardButtonBase
},
installToggled: {
  ...CardButtonBase,
  backgroundColor: "#296829"
},
uninstall: {
  ...CardButtonBase
},
uninstallToggled: {
  ...CardButtonBase,
  backgroundColor: "#5f1919"
},
update: {
  ...CardButtonBase
}
}
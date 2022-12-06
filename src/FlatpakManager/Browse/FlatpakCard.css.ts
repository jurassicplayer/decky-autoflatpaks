const CardBase = {
  display: "flex",
  justifyContent: "space-between",
  borderRadius: "7px",
  minHeight: "3em",
  maxHeight: "3em",
  margin: "2px",
  padding: "5px 10px"
}

const CardButtonBase = {
  minWidth: '60px',
  maxWidth: "0px",
  margin: "2px",
  padding: "10px 10px"
}

export const Card = {
  focus: {
    ...CardBase,
    backgroundColor: "#4b6e90" //"#1f2933"
  },
  blur: {
    ...CardBase,
    backgroundColor: "#121c25"
  },
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
import { CSSProperties } from "react";
import { SteamCssVariables } from "../../Utils/SteamUtils";

export const CardInfo: {[key: string]: CSSProperties} = {
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    minWidth: "100%"
  },
  base: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    overflow: "scroll",
    whiteSpace: "nowrap",
    padding: "0px",
    color: SteamCssVariables.mainTextColor,
    backgroundColor: SteamCssVariables.customTransparent
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
    backgroundColor: SteamCssVariables.customStatusYellow
  },
  mask: {
    ...CardButtonBase
  },
  install: {
    ...CardButtonBase
  },
  installToggled: {
    ...CardButtonBase,
    backgroundColor: SteamCssVariables.customStatusGreen
  },
  uninstall: {
    ...CardButtonBase
  },
  uninstallToggled: {
    ...CardButtonBase,
    backgroundColor: SteamCssVariables.customStatusRed
  },
  update: {
    ...CardButtonBase
  }
}
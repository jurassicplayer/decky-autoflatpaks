import { CSSProperties } from "react";
import { SteamCssVariables } from "../../Utils/steam.css";

export const FlatpakManagerButtons: CSSProperties = {
  minWidth: "0",
  padding: "10px 0px",
  margin: "1px" 
}

const StatusBarBase: CSSProperties = {
  color: SteamCssVariables.mainTextColor,
  fontSize: "13px",
  overflow: "hidden",
  whiteSpace: "nowrap"
}

export const StatusBar: {[key: string]: CSSProperties} = {
  Default: {
    display: "none"
  },
  HiddenButton: {
    padding: "0px",
    background: "#fff0",
    color: "unset"
  },
  HiddenButtonHover: {
    padding: "0px",
    background: "#fff2",
    color: "unset"
  },
  CheckForUpdates: {
    ...StatusBarBase,
    backgroundColor: SteamCssVariables.customStatusGreen
  },
  ProcessingQueue: {
    ...StatusBarBase,
    backgroundColor: SteamCssVariables.customStatusRed
  }
}
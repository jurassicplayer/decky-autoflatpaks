import { CSSProperties } from "react";
import { SteamCssVariables } from "../Utils/SteamUtils";

const StatusBarBase: CSSProperties = {
  color: SteamCssVariables.mainTextColor,
  fontSize: "13px",
  overflow: "hidden",
  whiteSpace: "nowrap"
}

export const StatusBarCSS: {[key: string]: CSSProperties} = {
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
import { CSSProperties } from "react";

const StatusBarBase: CSSProperties = {
  color: "#FFFFFF",
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
    backgroundColor: "#0b6f4c"
  },
  ProcessingQueue: {
    ...StatusBarBase,
    backgroundColor: "#7a0a0a"
  }
}
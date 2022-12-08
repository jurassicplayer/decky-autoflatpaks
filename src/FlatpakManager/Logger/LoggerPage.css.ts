import { CSSProperties } from "react"

const HistoryScrollPanelBase: CSSProperties = {
  height: "95%",
  minHeight: "95%",
  margin: "0px",
  borderRadius: "7px",
  display: "flex",
  justifyContent: "center"
}
export const HistoryReadyScrollPanel: CSSProperties = {
  ...HistoryScrollPanelBase,
  backgroundColor: "#121c25"
}
export const HistoryNotReadyScrollPanel: CSSProperties = {
  ...HistoryScrollPanelBase,
  backgroundColor: "#0c1519"
}

export const HistoryLogContainer: CSSProperties = {
  margin: "20px 20px 0px 20px",
  paddingBottom: "15px",
  display: "flex",
  flexDirection: "column",
  minWidth: "95%"
}
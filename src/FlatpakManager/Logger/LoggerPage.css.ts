import { CSSProperties } from "react"
import { SteamCssVariables } from "../../Utils/SteamUtils"

const HistoryScrollPanelBase: CSSProperties = {
  height: "95%",
  minHeight: "95%",
  margin: "0px",
  borderRadius: SteamCssVariables.gpCornerLarge,
  display: "flex",
  justifyContent: "center"
}
export const HistoryReadyScrollPanel: CSSProperties = {
  ...HistoryScrollPanelBase,
  backgroundColor: SteamCssVariables.gpBackgroundLightSofter
}
export const HistoryNotReadyScrollPanel: CSSProperties = {
  ...HistoryScrollPanelBase,
  backgroundColor: SteamCssVariables.customSpinnerBgColor
}
export const HistoryLogContainer: CSSProperties = {
  margin: "20px 20px 0px 20px",
  paddingBottom: "15px",
  display: "flex",
  flexDirection: "column",
  minWidth: "95%"
}
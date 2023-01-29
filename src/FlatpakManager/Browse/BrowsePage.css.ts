import { CSSProperties } from "react"
import { SteamCssVariables } from "../../Utils/SteamUtils"

export const BrowsePageContainer: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  minHeight: "100%"
}

export const PackageListContainer: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  maxHeight: "100%",
  minWidth: "100%",
  overflow: "scroll"
}

export const RefreshButton: CSSProperties = {
  borderRadius: SteamCssVariables.gpCornerLarge,
  maxWidth: "99.5%",
  margin: "2px"
}
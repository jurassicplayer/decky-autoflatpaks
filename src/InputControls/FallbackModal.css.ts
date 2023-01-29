import { SteamCssVariables } from "../Utils/SteamUtils"

export const FallbackModalContainer = {
  maxHeight: "45vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "40px",
  marginBottom: "40px",
  overflow: "hidden"
}

export const FallbackModalContent = {
  backgroundColor: SteamCssVariables.gpBackgroundLightSofter,
  borderRadius: SteamCssVariables.gpCornerLarge,
  height: "fit-content",
  width: "70%",
  padding: "20px"
}

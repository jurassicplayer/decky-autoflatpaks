import { SteamCssVariables } from "../../Utils/SteamUtils"

const CardBase = {
  borderRadius: SteamCssVariables.gpCornerLarge,
  display: "flex",
  justifyContent: "space-between",
  minHeight: "3em",
  maxHeight: "3em",
  margin: "2px",
  padding: "5px 10px"
}

export const Card = {
  focus: {
    ...CardBase,
    backgroundColor: SteamCssVariables.gpStoreDarkGrey
  },
  blur: {
    ...CardBase,
    backgroundColor: SteamCssVariables.mainEditorInputBgColor
  }
}
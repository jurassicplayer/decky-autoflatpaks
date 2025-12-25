import { definePlugin } from "@decky/api"
import { staticClasses } from "@decky/ui"
import { FaShip } from "react-icons/fa"
import QAM from "./views/QAM"
import { AppContextProvider, PluginService } from "./plugin/context.v4"

export default definePlugin(() => {
  PluginService.getInstance().onMount()
  return {
    name: "AutoFlatpaks-UI",
    title: <div className={staticClasses.Title}>AutoFlatpaks</div>,
    content: <AppContextProvider><QAM/></AppContextProvider>,
    icon: <FaShip />,
    onDismount() {
      PluginService.getInstance().onDismount()
    },
  }
})

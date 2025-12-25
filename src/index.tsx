import { definePlugin, routerHook } from "@decky/api"
import { staticClasses } from "@decky/ui"
import { FaShip } from "react-icons/fa"
import QAM from "./views/QAM"
import { AppContextProvider, PluginService, withAppContext } from "./plugin/app.context"
import { logger } from "./plugin/backend"
import Manager from "./views/Manager"

export default definePlugin(() => {
  PluginService.getInstance().onMount().then(()=>{
    logger.debug("Adding manager route")
    routerHook.addRoute("/autoflatpaks/manager", withAppContext(Manager))
  })
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

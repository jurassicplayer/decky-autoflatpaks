import { definePlugin } from "@decky/api"
import { staticClasses } from "@decky/ui"
import { FaShip } from "react-icons/fa"
import { ActionType, AppContextProvider, PluginService } from "./plugin/app.context"
import i18n from "./locales/i18n"
import QAM from "./views/QAM"
import Manager from "./views/Manager"

export default definePlugin(() => {
  let pluginService = PluginService.getInstance()
  pluginService.onMount().then(()=>{
    pluginService.dispatch({type: ActionType.ADD_ROUTE, payload: {path: "/autoflatpaks/manager", component: Manager}})
    i18n()
  })
  return {
    name: "AutoFlatpaks-UI",
    title: <div className={staticClasses.Title}>{pluginService.state.appName}</div>,
    content: <AppContextProvider><QAM/></AppContextProvider>,
    icon: <FaShip />,
    onDismount() {
      PluginService.getInstance().onDismount()
    },
  }
})

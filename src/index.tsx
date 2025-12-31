import { definePlugin } from "@decky/api"
import { staticClasses } from "@decky/ui"
import { FaShip } from "react-icons/fa"
import { AppContextProvider, AppService } from "./plugin/app.context"
import i18n from "./locales/i18n"
import QAM from "./views/QAM"
import Manager from "./views/Manager"

export default definePlugin(() => {
  let appService = AppService.getInstance()
  appService.onMount().then(()=>{
    appService.registerRoute("/autoflatpaks/manager", Manager)
    i18n()
  })
  return {
    name: "AutoFlatpaks-UI",
    title: <div className={staticClasses.Title}>{appService.state.appName}</div>,
    content: <AppContextProvider><QAM/></AppContextProvider>,
    icon: <FaShip />,
    onDismount() {
      AppService.getInstance().onDismount()
    },
  }
})

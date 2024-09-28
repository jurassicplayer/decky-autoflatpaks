import { routerHook } from "@decky/api"
import { context } from "./context"
import { IObjectKeys } from "./common"
import Configuration from "../Views/Configuration"

interface IRoute extends IObjectKeys {
  url: string,
  exact: boolean
  component: () => JSX.Element
}
type IRoutes = IObjectKeys & {
  [key:string]: IRoute
}

const routes: IRoutes = {
  management: { url: '/autoflatpaks/manage', exact: true, component: Configuration },
  configuration: { url: '/autoflatpaks/configuration', exact: true, component: Configuration }
}

export function addRoute(url:string, component: React.ComponentType, exact:boolean=false){
  if (context.routes.includes(url)) return
  context.routes.push(url)
  if (exact) {
    routerHook.addRoute(url, component, {exact: exact})
  } else {
    routerHook.addRoute(url, component)
  }
}
function removeRoute(url:string) {
  if (!context.routes.includes(url)) return
  routerHook.removeRoute(url)
  context.routes = context.routes.filter((route) => route != url)
}
export function removeRoutes() {
  context.routes.forEach((route) => removeRoute(route))
}
export function addRoutes() {
  for (const [_, {url, exact, component}] of Object.entries(routes)) {
    addRoute(url, component, exact)
  }
}

export default routes
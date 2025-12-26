import { Focusable, SidebarNavigation, SidebarNavigationPage, Tab, Tabs } from "@decky/ui"
import { FC, useEffect, useMemo, useState } from "react"
import PackagesPage from "./Packages"
import PluginSettings from "./Settings/Settings"
import { FaArchive, FaBox, FaCog, FaNetworkWired, FaPuzzlePiece, FaStore } from "react-icons/fa"
import { logger } from "../../plugin/backend"
import { useAppContext } from "../../plugin/app.context"
import Debug from "../Debug"

enum ContentType {
  Packages = 'Packages',
  Install = 'Install',
  Sources = 'Sources',
  Maintenance = 'Maintenance',
  Settings = 'Settings',
  HelpGuide = 'Instructions'
}

export default function SideNavContent(){
  const {state} = useAppContext('SideNav')
  const {debugMode} = state
  const pages:SidebarNavigationPage[] = useMemo(()=>{
    let sideNavPages:SidebarNavigationPage[] = [
      {
        title: ContentType.Packages,
        content: <PackagesPage/>,
        icon: <FaBox/>,
        hideTitle: false,
        padding: 'none'
      },
      {
        title: ContentType.Install,
        content: <ServiceTabs contentType={ContentType.Install}/>,
        icon: <FaStore/>,
        hideTitle: false,
        padding: 'none'
      },
      {
        title: ContentType.Sources,
        content: <ServiceTabs contentType={ContentType.Sources}/>,
        icon: <FaNetworkWired/>,
        hideTitle: false,
        padding: 'none'
      },
      {
        title: ContentType.Maintenance,
        content: <ServiceTabs contentType={ContentType.Maintenance}/>,
        icon: <FaArchive/>,
        hideTitle: false,
        padding: 'none'
      },
      {
        title: ContentType.Settings,
        content: <ServiceTabs contentType={ContentType.Settings}/>,
        icon: <FaCog/>,
        hideTitle: true,
        padding: 'none'
      },
      {
        title: ContentType.HelpGuide,
        content: <ServiceTabs contentType={ContentType.HelpGuide}/>,
        icon: <FaPuzzlePiece/>,
        hideTitle: true,
        padding: 'none'
      }
    ]
    if (debugMode) sideNavPages.push({
      title: "Debug",
      content: <Debug/>,
      icon: <FaPuzzlePiece/>,
      hideTitle: false,
      padding: 'none'
    })
    return sideNavPages
  }, [debugMode])
  return (
    <SidebarNavigation pages={pages} />
  )
}

function ServiceTabs({contentType}: {contentType:ContentType}){
  const {state} = useAppContext('ServiceTabs')
  const { activeServices, appName } = state
  const [currentRoute, setCurrentRoute] = useState<string>("plugin")
  const [tabs, setTabs] = useState<Tab[]>([])
  const createTabs = ():Tab[] => {
    let pluginTabs:Tab[] = []
    if (contentType === ContentType.Settings) {
      pluginTabs.push({
        id: "plugin",
        title: appName,
        content: <PluginSettings key={"plugin-settings"}/>
      })
    }
    let serviceTabs:Tab[] = activeServices
      .map((service)=>{
        logger.debug("Creating tab for service: ", service.sourceKey)
        let ServiceComponent:FC|undefined
        if (contentType === ContentType.Sources && service.sourceSources !== undefined) {
          ServiceComponent = service.sourceSources()
        } else if (contentType === ContentType.Settings && service.sourceConfiguration !== undefined) {
          ServiceComponent = service.sourceConfiguration()
        } else if (contentType === ContentType.Maintenance && service.sourceMaintenance !== undefined) {
          ServiceComponent = service.sourceMaintenance()
        } else if (contentType === ContentType.HelpGuide && service.sourceHelpGuide !== undefined) {
          ServiceComponent = service.sourceHelpGuide()
        } else {
          return null
        }
        return {
          id: service.sourceKey,
          title: service.sourceDisplayName,
          content: <ServiceComponent key={service.sourceKey}/>
        } as Tab
      })
      .filter((tab)=>tab !== null)
    return [...pluginTabs, ...serviceTabs]
  }
  useEffect(()=>{
    logger.debug('Active services or ContentType has changed')
    let tabs = createTabs()
    setTabs(tabs)
    if (!tabs.some(t => t.id === currentRoute) && tabs.length > 0) {
      setCurrentRoute(tabs[0].id)
    }
  }, [contentType, activeServices])

  return (
    <Focusable style={{minWidth: "100%", minHeight: "100%"}}>
      {tabs.length > 0 ?
        <Tabs
          activeTab={currentRoute}
          onShowTab={setCurrentRoute}
          tabs={tabs}
        />
      :null}
    </Focusable>
  )
}
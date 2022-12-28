import { Focusable, Tabs } from "decky-frontend-lib"
import { VFC, useState } from "react"
import { AboutPage } from "./About/AboutPage"
import { AdvancedPage } from "./Advanced/AdvancedPage"
import { BrowsePage } from "./Browse/BrowsePage"
import { LoggerPage } from "./Logger/LoggerPage"

export const FlatpakManager: VFC = () => {
  const [currentTabRoute, setCurrentTabRoute] = useState<string>("browser")

  return (
    <Focusable style={{minWidth: "100%", minHeight: "100%"}}>
    <div
      style={{
        marginTop: "40px",
        height: "calc(100% - 40px)",
        background: "#0c1519"
      }}>
      <Tabs
        activeTab={currentTabRoute}
        // @ts-ignore
        onShowTab={(tabID: string) => {
          setCurrentTabRoute(tabID);
        }}
        tabs={[
          {
            title: "Browse",
            content: <BrowsePage />,
            id: "browser",
          },
          {
            title: "Logger",
            content: <LoggerPage />,
            id: "logger",
          },
          {
            title: "Advanced",
            content: <AdvancedPage />,
            id: "advanced",
          },
          {
            title: "About",
            content: <AboutPage />,
            id: "about",
          }
        ]}
      />
    </div>
    </Focusable>
  )
}
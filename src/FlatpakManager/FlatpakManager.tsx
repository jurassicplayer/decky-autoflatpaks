import { Focusable, Tabs } from "decky-frontend-lib"
import { VFC, useEffect, useState } from "react"
import { BrowsePage } from "./Browse/BrowsePage"

export const FlatpakManager: VFC = () => {
  const [currentTabRoute, setCurrentTabRoute] = useState<string>("browser")
  
  useEffect(() => {
    console.log("On component loaded")
  },[])

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
          }
        ]}
      />
    </div>
    </Focusable>
  )
}
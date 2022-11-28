import { Tabs } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { BrowsePage } from "./BrowsePage"
import { InstalledPage } from "./InstalledPage"


export const FlatpakManager: VFC = () => {
  const [currentTabRoute, setCurrentTabRoute] = useState<string>("installed")

  useEffect(() => {
    console.log("On component loaded")
  },[])
  return (
    <div
      style={{
        marginTop: "40px",
        height: "calc(100% - 40px)",
        background: "#0c1519",
      }}
    >
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
            title: "Installed",
            content: <InstalledPage />,
            id: "installed",
          },
        ]}
      />
    </div>
  );
};
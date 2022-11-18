import { Tabs } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { Backend } from "../Utils/Backend"

//import { BrowsePage } from "./BrowsePage"
import { InstalledPage } from "./InstalledPage"

import { FlatpakMetadata } from "./Flatpak"
//import { FlatpakCard } from "./FlatpakCard"


const getRemotePackagesList = async (): Promise<{[key: string]: FlatpakMetadata}> => {
  var output = (await Backend.getRemotePackageList()) as {[key: string]: FlatpakMetadata}
  return output
}

const getLocalPackagesList = async (): Promise<{[key: string]: FlatpakMetadata}> => {
  var output = (await Backend.getLocalPackageList()) as {[key: string]: FlatpakMetadata}
  return output
}

const getMaskList = async (): Promise<Array<string>> => {
  let maskList = ['org.yuzu_emu.yuzu']
  return maskList
}

const mergeLists = async (rpl: {[key: string]: FlatpakMetadata}, lpl: {[key: string]: FlatpakMetadata}, ml: Array<string>): Promise<{[key: string]: FlatpakMetadata}>=> {
  var packageList = {...lpl}
  for (let appId in lpl) {
    // Mark installed / masked packages
    packageList[appId].installed      = true
    packageList[appId].masked         = (packageList[appId].application in ml) ? true : false
  }
  for (let appId in rpl) {

    // Add remote packges to final list
    if (!(appId in packageList)) { packageList[appId] = rpl[appId] }
    // Add metadata from remote packages into local package metadata
    packageList[appId].commit         = rpl[appId].commit
    packageList[appId].installed_size = rpl[appId].installed_size
    packageList[appId].download_size  = rpl[appId].download_size
  }
  return packageList
}



export const FlatpakManager: VFC = () => {
  const [currentTabRoute, setCurrentTabRoute] = useState<string>("installed")
  const [packageList, setPackageList] = useState<{[key: string]: FlatpakMetadata}>({})

  // const FlatpakCards = Object.values(packageList).map(item => (
  //   <FlatpakCard data={item} />
  // ))

  useEffect(() => {
    console.log("On component loaded")
    console.log("Pulling package list data")
    var rpl: {[key: string]: FlatpakMetadata}
    var lpl: {[key: string]: FlatpakMetadata}
    var ml:  Array<string>
    getRemotePackagesList().then((result) => {
      rpl = result
      getLocalPackagesList().then((result) => {
        lpl = result
        getMaskList().then((result) => {
          ml = result
          mergeLists(rpl, lpl, ml).then((result) => {
            setPackageList(result)
          })
        })
        
      })
    })
  },[])
  useEffect(() => {
    console.log("FlatpakManager.tsx: packageList changed")
  }, [packageList])

  return (
    <div
      style={{
        marginTop: "40px",
        height: "calc(100% - 40px)",
        background: "#0005",
      }}
    >
      <Tabs
        activeTab={currentTabRoute}
        // @ts-ignore
        onShowTab={(tabID: string) => {
          setCurrentTabRoute(tabID);
        }}
        tabs={[
          // {
          //   title: "Browse",
          //   content: <BrowsePage pList={FlatpakCards}/>,
          //   id: "browser",
          // },
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
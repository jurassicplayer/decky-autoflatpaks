import { deepSignal } from "deepsignal"
import { RemoteType } from "./remotes"
import { Installation } from "../pyinterops"

export type InstallationType = {
  sectionName: string  // sectionName
  path: string
  displayName?: string
  priority?: number
  storageType?: string
  configFile: string  // config file path
}

export enum EStorageType {
  network = "Network",
  mmc = "MMC",
  sdcard = "SD Card",
  harddisk = "Hard Disk"
}

export const systemInstallation:InstallationType = {
  sectionName: "default",
  path: "/var/lib/flatpak",
  configFile: ""
}
export const userInstallation:InstallationType = {
  sectionName: "user",
  path: "",
  configFile: ""
}
export const floatingInstallation = deepSignal<{installations: InstallationType[]}>({installations:[]})

export const InstallationsState = deepSignal<{
  installations:InstallationType[],
  remotes:RemoteType[],
  installationRemotesMap: {[key:string]: RemoteType[]},
  selected:InstallationType|null,
  configFiles:string[],
  userSysInsertIdx:number,
  refreshState:()=>Promise<void>,
  reSortInstallationRemote:()=>void}>({
    installations: [],
    remotes: [],
    installationRemotesMap: {},
    selected: null,
    get configFiles():string[] {return InstallationsState.installations.map((installation)=>installation.configFile)},
    get userSysInsertIdx():number {return InstallationsState.installations.map(x=>x.priority??0).lastIndexOf(0)+1},
    refreshState: async ()=>{
      InstallationsState.installations = await getInstallationsState()
      //InstallationsState.remotes = []
      InstallationsState.installationRemotesMap = {}
      for (let installation of InstallationsState.installations){
        let installationRemotes = await getInstallationRemotes(installation.sectionName)
        InstallationsState.installationRemotesMap[installation.sectionName] = installationRemotes
      }
      InstallationsState.installationRemotesMap[systemInstallation.sectionName] = (await getInstallationRemotes(systemInstallation.sectionName))
      if (await Installation.getUserInstallationPath()) {
        InstallationsState.installationRemotesMap[userInstallation.sectionName] = (await getInstallationRemotes(userInstallation.sectionName))
      }
      for (let installationSectionName in InstallationsState.installationRemotesMap){
        // Order remotes by remote priority here
        InstallationsState.installationRemotesMap[installationSectionName].sort((a,b) => ((b.priority??0) - (a.priority??0)) || (a.name??"").localeCompare(b.name??""))
      }
      // InstallationRemoteMap.splice(usersysInsertIdx, 0, (await getInstallationRemotes(systemInstallation.sectionName)))
      // if (await Installation.getUserInstallationPath()) {
      //   InstallationRemoteMap.splice(usersysInsertIdx, 0, (await getInstallationRemotes(userInstallation.sectionName)))
      // }
      // InstallationRemoteMap.forEach(installation => {
      //   installation.forEach(remote => InstallationsState.remotes.push(remote))
      // })
      // InstallationsState.installationRemotesMap = InstallationRemoteMap
    },
    reSortInstallationRemote: ()=>{
      InstallationsState.installations.sort((a,b) => ((b.priority??0) - (a.priority??0)) || (a.displayName??"").localeCompare(b.displayName??""))
      for (let installationSectionName in InstallationsState.installationRemotesMap){
        // Order remotes by remote priority here
        InstallationsState.installationRemotesMap[installationSectionName].sort((a,b) => ((b.priority??0) - (a.priority??0)) || (a.name??"").localeCompare(b.name??""))
      }
    }
  }
)


const getInstallationsState: ()=>Promise<InstallationType[]> = async () => {
  let installations:InstallationType[] = []
  if (floatingInstallation.installations.length > 0){
    installations = floatingInstallation.installations
  } else {
    installations.push({sectionName: '6f237f72-e8aa-4639-8618-b7665b44c8b4', displayName: 'Extra', path: '/var/etc/flatpak', priority: 1, configFile: 'extras.conf', storageType: 'harddisk'})
    installations.push({sectionName: '6ec1bc37-83cc-4131-80a0-e0805a8c23df', displayName: 'ExtraPlace', path: '/var/etc/flatpak', configFile: 'default.conf'})
    installations.push({sectionName: '3176a587-e8dc-4e5f-95c5-4d2dca30afd4', displayName: 'DailyHome', path: '/var/etc/flatpak', configFile: 'default.conf'})
    installations.push({sectionName: 'a81ed7b5-a249-4b92-aeca-a59cf21e111b', displayName: 'BottomDollar', path: '/var/etc/flatpak', priority: -1, configFile: 'bottomDollar.conf'})
    installations.push({sectionName: '3777955e-c960-4fda-a606-2c250ac761b8', displayName: 'Home', path: '/var/etc/flatpak', priority: 3, configFile: 'nondefault.conf'})
    floatingInstallation.installations = installations
  }
  // Order installations by installation priority here
  installations.sort((a,b) => ((b.priority??0) - (a.priority??0)) || (a.displayName??"").localeCompare(b.displayName??""))
  return installations
}
const getInstallationRemotes: (installationSectionName:string)=>Promise<RemoteType[]> = async (installationSectionName) => {
  let remotes:RemoteType[] = []
  remotes.push({
    installationSectionName: installationSectionName,
    name: "flathub",
    title: "Flathub",
    url: "https://dl.flathub.org/repo",
    collectionID: "",
    subset: "",
    filter: "",
    priority: 0,
    options: "",
    comment: "Central repository of Flatpak applications",
    description: "Central repository of Flatpak applications",
    homepage: "https://flathub.org",
    icon: "https://dl.flathub.org/repo/logo.svg"
  })
  remotes.push({
    installationSectionName: installationSectionName,
    name: "flathub-beta",
    title: "Flathub Beta",
    url: "https://dl.flathub.org/beta-repo",
    collectionID: "",
    subset: "",
    filter: "",
    priority: 0,
    options: "",
    comment: "Beta builds of Flatpak applications",
    description: "Beta builds of Flatpak applications",
    homepage: "https://flathub.org",
    icon: "https://dl.flathub.org/repo/logo.svg"
  })
  return remotes
}
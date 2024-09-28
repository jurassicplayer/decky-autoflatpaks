import { SidebarNavigation } from "@decky/ui"
import Installations from "../Flatpak/Installations/installations"
import { FaCloud, FaFolder, FaInfo, FaSync } from "react-icons/fa"

function Content(){
  const pages = [
    {
      title: 'Installations',
      content: <Installations/>,
      icon: <FaFolder/>,
      hideTitle: true
    },
    {
      title: 'Remotes',
      content: <Installations/>,
      icon: <FaCloud/>,
      hideTitle: true
    },
    {
      title: 'AutoUpdate',
      content: <Installations/>,
      icon: <FaSync/>,
      hideTitle: true
    },
    {
      title: 'About',
      content: <Installations/>,
      icon: <FaInfo/>,
      hideTitle: true
    }
  ]
  return (
    <SidebarNavigation pages={pages} />
  )
}

export default Content
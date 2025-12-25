import { Focusable } from "@decky/ui"
import PackageListItem from "./PackageListItem"
import { flexSplitScreen } from "./PackagePage.css"

export default function PackageList(){
  const packages = [
    {name: "Anki", packageID: "net.ankiweb.Anki"},
    {name: "Bino", packageID: "org.bino3d.bino"},
    {name: "Gnome Application Platform version 48", packageID: "org.freedesktop.Platform.GL32.nvidia-575-57-08"}
  ]
  return (
    <Focusable style={{...flexSplitScreen, background: "#9b99b9", rowGap: "0.1em"}}>
      {packages.map(package_data => <PackageListItem {...package_data} />)}
    </Focusable>
  )
}
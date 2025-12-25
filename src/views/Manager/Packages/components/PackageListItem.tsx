import { DialogButton } from "@decky/ui"
import { usePackagePageContext } from "./PackagePageContext"
import { flexColumn } from "./PackagePage.css"

interface PackageListItemProps {
  name:string
  packageID:string
}
export default function PackageListItem(props:PackageListItemProps){
  const { selectedPackage, setSelectedPackage } = usePackagePageContext()
  return (
    <DialogButton onGamepadFocus={()=>setSelectedPackage(props)} style={{...flexColumn, borderRadius: "0.5em", background:selectedPackage?.packageID == props.packageID ? "#866" : "#794"}}>
      <span style={{fontSize:"1em"}}>{props.name}</span>
      <span style={{fontSize:"0.8em"}}>{props.packageID}</span>
    </DialogButton>
  )
}
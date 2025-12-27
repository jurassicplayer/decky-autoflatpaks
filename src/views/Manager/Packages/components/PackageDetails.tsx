import { DialogButton, Focusable } from "@decky/ui"
import { PackageDetailsType, usePackagePageContext } from "./PackagePageContext"
import { cardStyle, flexSplitScreen } from "../../../../common/styles.css"


export default function PackageDetails(){
  const { selectedPackage } = usePackagePageContext()
  return (
    <>
      <Focusable style={{...flexSplitScreen, background: "#bb99b9", ...cardStyle}}>
        { selectedPackage ? <InnerDetails {...selectedPackage}/> : null }
      </Focusable>
    </>
  )
}

function InnerDetails(props: PackageDetailsType){
  return (
    <>
      <span style={{fontSize:"1em"}}>{props.name}</span>
      <span style={{fontSize:"0.8em"}}>{props.packageID}</span>
      <DialogButton>Uninstall</DialogButton>
    </>
  )
}
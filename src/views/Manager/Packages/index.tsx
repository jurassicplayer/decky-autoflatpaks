import { Focusable } from "@decky/ui"
import { PackagePageContextProvider } from "./components/PackagePageContext"
import PackageList from "./components/PackageList"
import PackageDetails from "./components/PackageDetails"
import { flexRow } from "./components/PackagePage.css"

interface temporaryProps {
  id?:string
}
export default function Content(props:temporaryProps){
  return (
    <PackagePageContextProvider>
      <Focusable style={{...flexRow, minWidth: "100%", minHeight: "100%"}}>
        <PackageList/>
        <PackageDetails/>
      </Focusable>
    </PackagePageContextProvider>
  )
}
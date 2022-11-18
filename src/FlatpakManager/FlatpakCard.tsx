import { FlatpakMetadata } from "./Flatpak"
import { Focusable, DialogButton } from "decky-frontend-lib"
import { FaDownload, FaTrashAlt, FaEye, FaEyeSlash } from "react-icons/fa"

export interface FlatpakCardProps {
  data: FlatpakMetadata
  onClickInstall?: (e: MouseEvent) => void
  onClickUninstall?: (e: MouseEvent) => void
  onClickMask?: (e: MouseEvent) => void
  onClickUnmask?: (e: MouseEvent) => void
}

const onOptionsButton = (e: CustomEvent) => {
  console.log(e)
  console.log("Options button")
}
const onClick = (e: MouseEvent) => {
  console.log(e)
  console.log("Click button")
}
const onSecondaryButton = (e: CustomEvent) => {
  console.log(e)
  console.log("Secondary button")
}

export function FlatpakCard(props: FlatpakCardProps) {
  return (
    <div
      style={{ margin: "2px", padding: "5px 10px", display: "flex", flexDirection: "row", justifyContent: "space-between"}}

      flow-children="horizontal"
      >
      <div className="FlatpakInfo"
        style={{ display: "flex", flexDirection: "column" }}
        flow-children="vertical"
        >
        <div>{props.data?.name}</div>
        <div>{props.data?.description}</div>
      </div>
      <Focusable
        style={{ display: "inline-flex" }}
        flow-children="horizontal">
        <DialogButton
          style={{ minWidth: '100px', maxWidth: "0px", margin: "1px", padding: "10px 16px" }}
          onOptionsButton={onOptionsButton}
          onSecondaryButton={onSecondaryButton}>
          {props.data.masked ? <FaEye /> : <FaEyeSlash />}
          {props.data.masked ? 'Unmask' : 'Mask'}
        </DialogButton>
        <DialogButton
          style={{ minWidth: '100px', maxWidth: "0px", margin: "1px", padding: "10px 16px" }}
          onOptionsButton={onOptionsButton}
          onSecondaryButton={onSecondaryButton}>
          {props.data.installed ? <FaTrashAlt /> : <FaDownload />}
          {props.data.installed ? 'Uninstall' : 'Install'}
        </DialogButton>
      </Focusable>
    </div>
  )
}

export default FlatpakCard
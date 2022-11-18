import { Focusable, DialogButton } from "decky-frontend-lib"
import { FaArrowUp, FaArrowDown } from "react-icons/fa"


export interface SpinnerProps {
  label?: string
  value: number
  onClickUp?: (e: MouseEvent) => void
  onClickDown?: (e: MouseEvent) => void
}

export function Spinner(props: SpinnerProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }} flow-children="horizontal">
      <div>{props.label}</div>
      <div>{props.value}</div>
      <Focusable
        style={{ maxHeight: "25px", display: "inline-flex" }}
        flow-children="horizontal">
        <DialogButton style={{ minWidth: '0', maxWidth: "0px", padding: "10px 16px", marginRight: "1px" }} onClick={props.onClickUp}><FaArrowUp style={{ verticalAlign: "top", marginTop: "-5px", marginLeft: "-8px" }}/></DialogButton>
        <DialogButton style={{ minWidth: '0', maxWidth: "0px", padding: "10px 16px", marginLeft: "1px"  }} onClick={props.onClickDown}><FaArrowDown style={{ verticalAlign: "top", marginTop: "-5px", marginLeft: "-8px" }}/></DialogButton>
      </Focusable>
    </div>
  )
}

export default Spinner
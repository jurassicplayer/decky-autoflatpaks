import { FallbackModal } from "../../InputControls/FallbackModal"

export const RunningPackagesModal = (props: {closeModal?: CallableFunction, runningPackages: string[]}) => {
  return (
    <FallbackModal
      bDestructiveWarning={true}
      strTitle='Error: Running Packages Detected'
      strDescription='This procedure is possibly destructive and it is recommended to close any currently running flatpaks before and while performing this action to prevent any possible issues.'
      bAlertDialog={true}
      closeModal={()=>{
        if (props.closeModal) { props.closeModal() }
      }}><br />
      List of running packages:
      <div style={{
        display: "flex",
        flexDirection: "column",
        margin: "0px 30px 0px 30px"
        }}>
        {props.runningPackages.sort((a:string, b:string) => a.localeCompare(b)).map((item: string) => 
          <div>{item}</div>
        )}
      </div>
    </FallbackModal>
  )
}
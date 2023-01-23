import { Backend } from "../../Utils/Backend"
import { FallbackModal } from "../../InputControls/FallbakModal"

const flatpakRepair = async (dryrun?: boolean) => {
  let output = await Backend.RepairPackages(dryrun)
  console.log(dryrun ? 'Repair (dryrun): ': 'Repair: ', output)
}


export const RepairPackagesModal = (props: any) => {
  return (
    <FallbackModal
      bDestructiveWarning={true}
      strTitle='Repair Packages'
      strDescription='Only use this if you know what you are doing. Refer to flatpak-repair for more information of what this command will do. While running, most of AutoFlatpaks functions will be disabled.'
      /*
      strOKButtonText='DryRun'
      strMiddleButtonText='Run'
      onOK={() => flatpakRepair(true)}
      onMiddleButton={() => flatpakRepair()}
      */
      strOKButtonText='Run'
      onOK={() => flatpakRepair()}
      closeModal={()=>{
        if (props.closeModal) { props.closeModal() }
      }} />
  )
}
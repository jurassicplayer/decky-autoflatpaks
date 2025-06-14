import { ConfirmModal, ConfirmModalProps, TextField } from "@decky/ui"
import { ReactNode, useState } from "react"

export function ConfirmationModal(props: ConfirmModalProps){
  const closeModal = ()=>{if (props.closeModal) props.closeModal()}
  const onOK = ()=>{
    if (props.onOK) props.onOK()
    closeModal()
  }
  return (
    <ConfirmModal
      {...props}
      onCancel={closeModal}
      onEscKeypress={closeModal}
      onOK={onOK}
      />
  )
}

export interface NameModalProps extends ConfirmModalProps {
  name: string
  setName: (name: string)=>void
  strLabel?: ReactNode
  strTextFieldDescription?: ReactNode
}
export function NameModal(props: NameModalProps){
  const [name, setName] = useState<string>(props.name)
  const onOK = ()=>props.setName(name)
  return (
    <ConfirmationModal
      {...props}
      onOK={onOK}
      >
      <TextField
        label={props.strLabel}
        description={props.strTextFieldDescription}
        focusOnMount={true}
        value={name}
        onChange={(event)=>setName(event.currentTarget.value)}
        />
    </ConfirmationModal>
  )
}

export default NameModal
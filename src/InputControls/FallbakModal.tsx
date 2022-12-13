import { VFC } from "react";
import { Focusable, ModalRoot, ModalRootProps } from "decky-frontend-lib"
import { FallbackModalContainer, FallbackModalContent } from "./FallbackModal.css"


export const FallbackModal: VFC<ModalRootProps> = (props) => {
  const closeModal = () => {
    if (props.onCancel) props.onCancel()
    if (props.closeModal) props.closeModal()
  }
  if (ModalRoot != undefined) {
    return (
      <ModalRoot
        onCancel={props.onCancel}
        closeModal={props.closeModal}
        onOK={props.onOK}
        onEscKeypress={props.onEscKeypress}
        className={props.className}
        modalClassName={props.modalClassName}
        bAllowFullSize={props.bAllowFullSize}
        bDestructiveWarning={props.bDestructiveWarning}
        bDisableBackgroundDismiss={props.bDisableBackgroundDismiss}
        bHideCloseIcon={props.bHideCloseIcon}
        bOKDisabled={props.bOKDisabled}
        bCancelDisabled={props.bCancelDisabled}
      >{props.children}</ModalRoot>
    )
  } else {
    return (
      <Focusable
        className="modal"
        style={FallbackModalContainer}
        onCancel={closeModal}
        onClick={e => {
          if (!e.currentTarget.classList.contains("gpfocuswithin")) {
            closeModal()
          }
        }}>
        <Focusable
          style={FallbackModalContent}>
          {props.children}
        </Focusable>
      </Focusable>
    )
  }
}
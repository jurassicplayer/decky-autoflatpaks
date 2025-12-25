import { toaster } from "@decky/api"
import { DialogButton } from "@decky/ui"

export default function Content(){
  const sendToast = ()=>{
    // title: ReactNode;
    // body: ReactNode;
    // subtext?: ReactNode;
    // logo?: ReactNode;
    // icon?: ReactNode;
    // timestamp?: Date;
    // onClick?: () => void;
    // className?: string;
    // contentClassName?: string;
    // duration?: number;
    // expiration?: number;
    // critical?: boolean;
    // eType?: number;
    // sound?: number;
    // showNewIndicator?: boolean;
    // playSound?: boolean;
    // showToast?: boolean;
    toaster.toast({
      title: "ToastTitle",
      body: "ToastBody"
    })
  }
  return (
    <>
    <DialogButton onClick={sendToast}>Send toast</DialogButton>
    </>
  )
}
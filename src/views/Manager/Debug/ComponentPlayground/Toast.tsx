import { toaster } from "@decky/api"
import { DialogBody, DialogButton, DropdownItem, Focusable, SingleDropdownOption, SliderField, TextField, ToggleField } from "@decky/ui"
import { useState } from "react"
import { NavSoundMap } from "../../../../common/steamclient"
import { FaAirbnb, FaAndroid, FaApple, FaGithub, FaSteam } from "react-icons/fa"

export default function Content(){
  const [status, setStatus] = useState<string|null>(null)
  const [title, setTitle] = useState<string>("ToastTitle")
  const [body, setBody] = useState<string>("ToastBody")
  const [subtext, setSubtext] = useState<string|undefined>("ToastSubtext")
  const [logo, setLogo] = useState<string|undefined>('<FaSteam/>')
  const [icon, setIcon] = useState<string|undefined>('<FaGithub/>')
  // const [timestamp, setTimestamp] = useState<Date|undefined>(new Date())
  const [duration, setDuration] = useState<number|undefined>(2000)
  const [expiration, setExpiration] = useState<number|undefined>(2000)
  const [critical, setCritical] = useState<boolean|undefined>(false)
  // const [eType, setEType] = useState<number|undefined>(0)
  const [sound, setSound] = useState<string>("ToastMisc")
  const [showNewIndicator, setShowNewIndicator] = useState<boolean|undefined>(false)
  const [playSound, setPlaySound] = useState<boolean|undefined>(true)
  const [showToast, setShowToast] = useState<boolean|undefined>(true)

  const images:SingleDropdownOption[]=[
    { data:'<FaGithub/>', label: <FaGithub/> },
    { data:'<FaAirbnb/>', label: <FaAirbnb/> },
    { data:'<FaAndroid/>', label: <FaAndroid/> },
    { data:'<FaApple/>', label: <FaApple/> },
    { data:'<FaSteam/>', label: <FaSteam/> },
  ]
  const sounds:SingleDropdownOption[]=[]
  for (let key in NavSoundMap) {
    let sfx = NavSoundMap[key]
    if (typeof sfx != 'string') { continue }
    sounds.push({
      label: sfx.replace(/([A-Z])/g, ' $1').trim(),
      data: sfx
    })
  }
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
    let toastData = {
        title: title,
        body: body,
        subtext: subtext,
        logo: images.find((image)=>image.data == logo)?.label,
        icon: images.find((image)=>image.data == icon)?.label,
        duration: duration,
        expiration: expiration,
        critical: critical,
        //eType: eType, //needs eFeature: 11, 13, 25 // Certain kind of toast: 6, 12, 22, 24, 26
        sound: NavSoundMap[sound],
        showNewIndicator: showNewIndicator,
        playSound: playSound,
        showToast: showToast
      }
    try {
      setStatus(JSON.stringify(toastData))
      toaster.toast(toastData)
    } catch (error) {
      setStatus(`Failed to send ToastData: ${JSON.stringify(toastData)}`)
    }
  }
  return (
    <>
    <DialogBody>
    <Focusable preferredFocus={true} onSecondaryActionDescription="Test" onSecondaryButton={sendToast}>
      {status
      ?<div style={{fontSize: "10px"}}>{status}</div>
      :null  
      }
      <DialogButton onClick={sendToast}>Send toast</DialogButton>
      <TextField
        label="Title"
        value={title}
        onChange={(e)=>{
          setTitle(e.currentTarget.value)
        }}
      />
      <TextField
        label="Body"
        value={body}
        onChange={(e)=>{
          setBody(e.currentTarget.value)
        }}
      />
      <TextField
        label="Subtext"
        value={subtext??""}
        onChange={(e)=>{
          setSubtext(e.currentTarget.value)
        }}
      />
      <DropdownItem
        rgOptions={images}
        selectedOption={logo}
        label="Logo"
        onChange={(e)=>setLogo(e.data)}
      />
      <DropdownItem
        rgOptions={images}
        selectedOption={icon}
        label="Icon"
        onChange={(e)=>setIcon(e.data)}
      />
      <SliderField
        value={duration??0}
        min={0}
        max={10000}
        showValue={true}
        editableValue={true}
        notchTicksVisible={true}
        label="Duration"
        onChange={setDuration}
      />
      <SliderField
        value={expiration??0}
        min={0}
        max={10000}
        showValue={true}
        editableValue={true}
        notchTicksVisible={true}
        label="Expiration"
        onChange={setExpiration}
      />
      {/* <SliderField
        value={eType??0}
        min={0}
        max={31}
        showValue={true}
        editableValue={true}
        notchTicksVisible={true}
        label="eType"
        onChange={setEType}
      /> */}
      <DropdownItem
        rgOptions={sounds}
        selectedOption={sound}
        label="Sound"
        onChange={(e)=>setSound(e.data)}
      />
      <ToggleField
        label="Critical"
        checked={critical??false}
        onChange={setCritical}
      />
      <ToggleField
        label="ShowNewIndicator"
        checked={showNewIndicator??false}
        onChange={setShowNewIndicator}
      />
      <ToggleField
        label="PlaySound"
        checked={playSound??false}
        onChange={setPlaySound}
      />
      <ToggleField
        label="ShowToast"
        checked={showToast??false}
        onChange={setShowToast}
      />
    </Focusable>
    </DialogBody>
    </>
  )
}
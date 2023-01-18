import { useState, VFC } from "react"
import { useInView } from "react-intersection-observer"
import { Card } from "./FlatpakCard.css"
import { FlatpakMetadata } from "../../Utils/Flatpak"
import { FlatpakCardInfo } from "./FlatpakCardInfo"


export const FlatpakCard: VFC<{data: FlatpakMetadata}> = (props) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '700px 0px 700px'
  })
  const [focus, setFocus] = useState<boolean>(false)
  
  return (
    <div
      ref={ref}
      style={focus ? Card.focus : Card.blur}
      onFocus={()=>setFocus(true)}
      onBlur={()=>setFocus(false)}>
      {inView
      ? <FlatpakCardInfo data={props.data} focus={focus} />
      : null }
    </div>
  )
}
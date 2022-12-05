import { useEffect, useState, VFC } from "react"
import { useInView } from "react-intersection-observer"
import { Card } from "./FlatpakCard.css"
import { FlatpakMetadata } from "../../Utils/Flatpak"
import { FlatpakCardInfo } from "./FlatpakCardInfo"


export const FlatpakCard: VFC<{data: FlatpakMetadata}> = (props) => {
  const { ref, inView } = useInView({
    //triggerOnce: true,
    rootMargin: '100px 100px'
  })
  const [focus, setFocus] = useState<boolean>(false)
  
  useEffect(() => {
    console.log("Card loaded: ", props.data.ref)
  }, [])
  useEffect(() => () => {
    console.log("Card unloaded: ", props.data.ref)
  }, [])

  return (
    <div
      ref={ref}
      style={focus ? Card.focus : Card.blur}
      onFocus={()=>setFocus(true)}
      onBlur={()=>setFocus(false)}>
      {inView
      ? <FlatpakCardInfo data={props.data} />
      : null }
    </div>
  )
}
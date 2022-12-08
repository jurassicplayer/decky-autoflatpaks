import { JournalEntry } from "../../Utils/History"
import { useInView } from "react-intersection-observer"

export const LogEntry = (props: {entry: JournalEntry}) => {
  const { ref, inView } = useInView({ rootMargin: '100px 100px' })
  const entryTimestamp = new Date(props.entry.__REALTIME_TIMESTAMP / 1000)
  const date: string = entryTimestamp.toLocaleDateString().toString().split('/',2).map(digit => digit.padStart(2,'0')).join('/')
  const time: string = entryTimestamp.toLocaleTimeString().padStart(11, '0')
  return (
    <div ref={ref} style={{minHeight: "0.85em"}} >
      {inView
      ? <div style={{fontSize: "0.85em"}}>{date} - {time}: {props.entry.MESSAGE.split('system: ')[1]}</div>
      : null }
    </div>
  )
}
import { useEffect, useState, VFC } from "react"
import { Focusable } from "decky-frontend-lib"
import { Backend } from "../../Utils/Backend"
import { JournalEntry } from "../../Utils/History"

export const LoggerPage: VFC = () => {
  const [history, setHistory] = useState<JournalEntry[]>([])
  useEffect(() => {
    Backend.getPackageHistory().then((history) => setHistory(history))
  }, [])
  useEffect(() => {
    console.log(history)
  }, [history])

  return (
    <Focusable>
      {history ? 
        history.map(entry => {return (<div>{entry.MESSAGE}</div>)})
      : null}
      <h2>Work In Progress</h2>
      <p>
        This is a tentative area that will be a place that acts as a UI to the "flatpak history" command.
      </p>
      <ul>
        <li>Provides options for since time, until time, reverse order</li>
        <li>Lists installs, updates, and removals of applications and runtimes</li>
      </ul>
    </Focusable>
  )
}
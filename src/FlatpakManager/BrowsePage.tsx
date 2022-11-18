import { useEffect, useState, VFC } from "react"

export const BrowsePage: VFC<{pList: JSX.Element[]}> = ({pList}) => {
  const [flatpakCards, setFlatpakCards] = useState<JSX.Element[]>(pList)

  useEffect(() => {
    console.log("On browse page load")
  }, [])
  useEffect(() => {
    console.log("On flatpak cards list change")
  }, [flatpakCards])
  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      {flatpakCards}
    </div>
  )
}
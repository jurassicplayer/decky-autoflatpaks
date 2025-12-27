import { Focusable, Tab, Tabs } from "@decky/ui"
import { useState } from "react"

import Toaster from "./ComponentPlayground/Toast"

const components = [
  {name: "Toaster", Component:Toaster},
]

export default function Content(){
  const tabs:Tab[] = components.map(({name, Component})=>{
    return {
      id: name,
      title: name,
      content: <Component/>
    } as Tab
  })
  const [currentRoute, setCurrentRoute] = useState<string>(tabs[0].id)

  return (
    <Focusable style={{minWidth: "100%", minHeight: "100%"}}>
      {tabs.length > 0 ?
        <Tabs
          activeTab={currentRoute}
          onShowTab={setCurrentRoute}
          tabs={tabs}
        />
      :null}
    </Focusable>
  )
}
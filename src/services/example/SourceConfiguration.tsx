import { TextField, ToggleField, DialogButton } from "@decky/ui"
import { PackageService, SettingsType } from "./Service"
import { useMemo, useState } from "react"
import { logger } from "../../plugin/backend"

export type ConfigurationComponentProps = {
  parentClass:PackageService
  settings:SettingsType
  getSettings:(keys: (keyof SettingsType)[]) => Promise<Partial<SettingsType>>
  setSettings:(settings: Partial<SettingsType>) => Promise<void>
}

export function ConfigurationComponent(props: ConfigurationComponentProps){
  const { settings } = props
  logger.debug(`Settings obtained by parent: ${JSON.stringify(settings)}`)
  const [cooked, setCooked] = useState(settings.cooked)
  const [recipe, setRecipe] = useState(settings.recipe)
  
  // Valid if something changed compared to original props.settings
  const valid = useMemo(
    () =>
      cooked !== settings.cooked ||
      recipe !== settings.recipe,
    [cooked, recipe, settings.cooked, settings.recipe]
  )
  return (
    <>
      <TextField onChange={(e)=>setRecipe(e.target.value)} value={recipe} />
      <ToggleField checked={cooked} onChange={setCooked} />
      <DialogButton disabled={!valid}>Save</DialogButton>
    </>
  )
}
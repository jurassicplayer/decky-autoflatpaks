import { TextField, ToggleField, DialogButton } from "@decky/ui"
import { PackageService, SettingsType } from "../example.service"
import { useMemo, useState } from "react"
import { ActionType, useAppContext } from "../../plugin/context.v4"
import { logger } from "../../plugin/backend"
//import { useAppContext, useAppState } from "../../plugin/context.v3"

export type ConfigurationComponentProps = {
  parentClass:PackageService
  settings:SettingsType
  getSettings:(keys: (keyof SettingsType)[]) => Promise<Partial<SettingsType>>
  setSettings:(settings: Partial<SettingsType>) => Promise<void>
}

export function ConfigurationComponent(props: ConfigurationComponentProps){
  const {state, dispatch} = useAppContext('Example Configuration Page')
  //const {debug} = useAppState()
  const { settings } = props
  logger.debug(`Settings obtained by parent: ${JSON.stringify(settings)}`)
  const [cooked, setCooked] = useState(settings.cooked)
  const [recipe, setRecipe] = useState(settings.recipe)
  const setDebug = (checked:boolean) => {
    dispatch({type: ActionType.SET_DEBUG, payload: checked})
  }
  
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
      <ToggleField checked={state.debug} onChange={setDebug} />
      <DialogButton disabled={!valid}>Save</DialogButton>
    </>
  )
}
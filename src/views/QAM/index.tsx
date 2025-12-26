import { ButtonItem, PanelSection, PanelSectionRow, Router, ToggleField } from "@decky/ui"
import { ActionType, useAppContext } from "../../plugin/app.context"

/* ##FIXME##
- Status bar on top
- Manage app button
- Check for updates button
- Install updates button
- Show list of available updates when present (click on status bar)
- Show last checked/next check timestamp (save/read timestamp to/from localstorage)
- Temporary disable notification/sound/update check
*/

export default function Content() {
  const {state, dispatch} = useAppContext("QAM")
  const setDebug = (checked:boolean) => {
    dispatch({type: ActionType.SET_DEBUGMODE, payload: checked})
  }
  const onClick01 = async () => {
    Router.CloseSideMenus()
    Router.Navigate("/autoflatpaks/manager")
  }

  const onClick02 = async () => {
  }

  const onClick03 = async () => {
  }

  return (
    <PanelSection title="Panel Section">
      <PanelSectionRow>
        <ButtonItem
          label="Function 01"
          description="A description"
          layout="below"
          onClick={onClick01}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem
          label="Function 02"
          layout="below"
          onClick={onClick02}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem
          label="Function 03"
          layout="below"
          onClick={onClick03}
        />
      </PanelSectionRow>
      <ToggleField checked={state.debugMode} onChange={setDebug} />
    </PanelSection>
  )
}
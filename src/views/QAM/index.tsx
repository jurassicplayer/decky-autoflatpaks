import { ButtonItem, PanelSection, PanelSectionRow, Router, ToggleField } from "@decky/ui"
import { ActionType, useAppContext } from "../../plugin/app.context"
import { useTranslation } from "react-i18next"
import { DialogBodyText } from "../../common/custom-components"

/* ##FIXME##
- Status bar on top
- Manage app button
- Check for updates button
- Install updates button
- Show list of available updates when present (click on status bar)
- Show last checked/next check timestamp (save/read timestamp to/from localstorage)
*/

export default function Content() {
  const {state, dispatch} = useAppContext("QAM")
  const { t } = useTranslation()
  const setTemporaryMode = (actionType: ActionType.SET_DEBUGMODE|ActionType.SET_TOASTMODE|ActionType.SET_SOUNDMODE|ActionType.SET_CHECKFORUPDATEMODE, checked:boolean)=>{
    dispatch({type: actionType, payload: checked})
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
    <>
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
    </PanelSection>
    <PanelSection title={t('quickaccessmenu:temporaryMode.title')}>
      <DialogBodyText style={{marginBottom:"8px"}}>{t('quickaccessmenu:temporaryMode.dialogbodytext')}</DialogBodyText>
      <PanelSectionRow>
        <ToggleField
          label={t('quickaccessmenu:temporaryMode.toast.label')}
          checked={state.toastMode}
          onChange={(checked)=>setTemporaryMode(ActionType.SET_TOASTMODE, checked)}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ToggleField
          label={t('quickaccessmenu:temporaryMode.sound.label')}
          checked={state.soundMode}
          onChange={(checked)=>setTemporaryMode(ActionType.SET_SOUNDMODE, checked)}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ToggleField
          label={t('quickaccessmenu:temporaryMode.checkforupdate.label')}
          checked={state.checkForUpdateMode}
          onChange={(checked)=>setTemporaryMode(ActionType.SET_CHECKFORUPDATEMODE, checked)}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ToggleField
          label={t('settings:plugin.developerMode.label')}
          checked={state.debugMode}
          onChange={(checked)=>setTemporaryMode(ActionType.SET_DEBUGMODE, checked)}
          bottomSeparator="none"
        />
      </PanelSectionRow>
    </PanelSection>
    </>
  )
}
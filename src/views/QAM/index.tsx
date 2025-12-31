import { ButtonItem, PanelSection, PanelSectionRow, Router, ToggleField } from "@decky/ui"
import { ActionType, useAppContext } from "../../plugin/app.context"
import { useTranslation } from "react-i18next"
import { DialogBodyText } from "../../common/custom-components"

/*
##TODO: Add status bar on top
##TODO: Add manage app button
##TODO: Check for updates button
##TODO: Install updates button
##TODO: Show list of available updates when present (click on status bar)
##TODO: Show last checked/next check timestamp (save/read timestamp to/from localstorage)
*/

export default function Content() {
  const {state, dispatch, setToastMode, setSoundMode, setCheckForUpdateMode} = useAppContext("QAM")
  const { t } = useTranslation()
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
          onChange={(checked)=>setToastMode(checked)}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ToggleField
          label={t('quickaccessmenu:temporaryMode.sound.label')}
          checked={state.soundMode}
          onChange={(checked)=>setSoundMode(checked)}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ToggleField
          label={t('quickaccessmenu:temporaryMode.checkforupdate.label')}
          checked={state.checkForUpdateMode}
          onChange={(checked)=>setCheckForUpdateMode(checked)}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ToggleField
          label={t('settings:plugin.developerMode.label')}
          checked={state.debugMode}
          onChange={(checked)=>dispatch({type: ActionType.SET_DEBUGMODE, payload: checked})}
          bottomSeparator="none"
        />
      </PanelSectionRow>
    </PanelSection>
    </>
  )
}
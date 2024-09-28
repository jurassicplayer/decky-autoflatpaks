import { ButtonItem, DialogButton, Focusable, Navigation, PanelSection, PanelSectionRow } from "@decky/ui"
import { useSignals } from "@preact/signals-react/runtime"
import { FaBoxOpen, FaDownload, FaSyncAlt } from "react-icons/fa"
import context from "../../Plugin/context"
import routes from "../../Plugin/routes"
import { FlatpakManagerButtons, StatusBar } from "./qam.css"
import { Installation } from "../../Plugin/pyinterops"


const onTestButton = () => {
  console.log(context)
  Installation.getAllInstallations().then(r=>context.statusText = r)
  context.isBusy = !context.isBusy
  context.statusText = Math.random().toString()
}

const onNavigation = (route:string) => {
  Navigation.CloseSideMenus()
  Navigation.Navigate(route)
}

function QAMStatusBar() {
  let css = StatusBar.CheckForUpdates
  return (
    <PanelSectionRow>
      { context.isBusy
        ? <DialogButton style={css}>
            {context.statusText}
          </DialogButton>
        : null}
    </PanelSectionRow>
  )
}

function QAMButtons() {
  return (
    <PanelSectionRow>
      <Focusable style={{display: "flex"}} flow-children="horizontal">
        <DialogButton
          style={FlatpakManagerButtons}
          onClick={() => onNavigation(routes.management.url)}
          onOKActionDescription='Manage Packages'><FaBoxOpen/>
        </DialogButton>
        <DialogButton
          style={FlatpakManagerButtons}
          onClick={() => onNavigation(routes.management.url)}
          disabled={context.isBusy}
          onOKActionDescription='Check Updates&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'><FaSyncAlt/>
        </DialogButton>
        <DialogButton
          style={FlatpakManagerButtons}
          onClick={() => onNavigation(routes.management.url)}
          disabled={context.isBusy}
          onOKActionDescription='Update Packages&nbsp;&nbsp;'><FaDownload/>
        </DialogButton>
      </Focusable>
    </PanelSectionRow>
  )
}

function Content() {
  useSignals()
  return (
    <PanelSection>
      <QAMStatusBar/>
      <QAMButtons/>
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => onNavigation(routes.configuration.url)}>
          Configuration
        </ButtonItem>
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={onTestButton}>
          Test Button {context.statusText}
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  )
}

export default Content
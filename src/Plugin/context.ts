import { deepSignal } from "deepsignal";
import { IObjectKeys } from "./common";

enum EAppState {
  IDLE,
  CHECKINGFORUPDATES, // Called to check for package updates and waiting for it to resolve
  PROCESSINGQUEUE, // Called flatpak install/update and waiting for it to resolve
  REPAIRINGPACKAGES, // Called flatpak repair and waiting for it to resolve
  DEGRADED, // The system state is degraded (ex. installations.d config has duplicate entries)
  ERROR // An unexpected error has occurred during regular function
}

interface IContext extends IObjectKeys {
  isInitialized: boolean
  isBusy: boolean
  appState: EAppState
  preferredInstallation: string
  routes: [string]
  statusText: string
}

export const context = deepSignal({
  isInitialized: false,
  isBusy: false,
  appState: EAppState.IDLE,
  preferredInstallation: null,
  routes: [],
  statusText: ''
} as unknown as IContext)




export default context
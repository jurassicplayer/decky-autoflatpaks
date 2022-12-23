import { DialogButton, findSP, Focusable, showModal } from "decky-frontend-lib"
import { VFC } from "react"
import { UnusedPackagesModal } from "./UnusedPackages"

export const AdvancedPage: VFC = () => {
  return (
    <div>
      <Focusable>
        <DialogButton
          onClick={() => {showModal(<UnusedPackagesModal/>, findSP(), {popupHeight: 100})}}>List Unused Packages</DialogButton>
      </Focusable>
      <h2>Work In Progress</h2>
      <p>
        This is a tentative area that will be a place for advanced functions that hopefully won't need to be used.
      </p>
      <ul>
        <li>Flatpak repair (and --dry-run?)</li>
        <li>Complex mask handling and controls (?)</li>
        <li>Toggle for aggressive filtering for app (BaseApp, BaseExtension) (?)</li>
        <li>Permissions Manager (GameMode integrated Flatseal maybe?)</li>
      </ul>
    </div>
  )
}
import { DialogButton, Focusable } from "decky-frontend-lib"
import { VFC } from "react"
import { Backend } from "../../Utils/Backend"

const onRemoveUnusedPackages = () => {
  Backend.RemoveUnusedPackages()
}

export const AdvancedPage: VFC = () => {
  return (
    <div>
      <Focusable><DialogButton onClick={() => onRemoveUnusedPackages()}>Remove Unused Packages</DialogButton></Focusable>
      <h2>Work In Progress</h2>
      <p>
        This is a tentative area that will be a place for advanced functions that hopefully won't need to be used.
      </p>
      <ul>
        <li>Flatpak repair (and --dry-run?)</li>
        <li>List unused packages (flatpak remove --unused)</li>
        <li>Complex mask handling and controls</li>
        <li>Toggle for aggressive filtering for app (BaseApp, BaseExtension)</li>
        <li>Permissions Manager (GameMode integrated Flatseal maybe?)</li>
      </ul>
    </div>
  )
}
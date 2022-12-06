import { VFC } from "react";

export const AdvancedPage: VFC = () => {
  return (
    <div>
      <h2>Work In Progress</h2>
      <p>
        This is a tentative area that will be a place for advanced functions that hopefully won't need to be used.
      </p>
      <ul>
        <li>Flatpak repair (and --dry-run?)</li>
        <li>List and remove unused packages (flatpak uninstall --unused)</li>
        <li>Complex mask handling and controls</li>
        <li>Permissions Manager (GameMode integrated Flatseal maybe?)</li>
      </ul>
    </div>
  )
}
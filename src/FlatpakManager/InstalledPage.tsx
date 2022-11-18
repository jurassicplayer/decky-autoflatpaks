import { VFC } from "react";

export const InstalledPage: VFC = () => {
  return (
    <div>
      <h2>Work In Progress</h2>
      <p>
        This area will be a place to manage packages.
        While this isn't intended to be a full flatpak manager/store for flatpaks, I am looking into adding functionality along the lines of:
        - Masking packages
        - Installing packages
        - Deleting packages
        - Filter by Flathub Categories (*)
        - Search (*)
        - Add to Steam (...maybe...really don't know about this one)
        
        * Flathub has an API that can be queried against for searches, categories, etc. but I hate the idea of hitting their servers excessively.
      </p>
    </div>
  )
}
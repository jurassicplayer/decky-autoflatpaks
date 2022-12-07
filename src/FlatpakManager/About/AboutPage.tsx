import { VFC } from "react";

export const AboutPage: VFC = () => {
  return (
    <div>
      <h2>Work In Progress</h2>
      <p>
        While AutoFlatpaks isn't intended to be a fully featured flatpak manager/store, it may end up being close, or even seen as one by some standards.<br />
        The final UI and features are not set in stone, and may be expanded upon/removed. The notes left in WIP pages are merely notes and ideas so I won't forget.<br />
        <br />
        This area will be a place to see information about the project including:<br />
      </p>
      <ul>
        <li>List of changes pulled from GH (?)</li>
        <li>List of changes hard-coded</li>
        <li>List of things I intend to fix</li>
        <li>List of things I intend to add</li>
      </ul>
      <ul>
        <li>Fix settings instantly being saved on QAM panel open</li>
        <li>Fix the bugginess of touch navigation in the flatpak manager</li>
        <li>Flathub API integration (?)</li>
        <li>Add to Steam (?)</li>
        <li>Remove minutes option</li>
        <li>Remove debug long process function</li>
        <li>Flatpak detailed info button</li>
        <li>Filter Search refinement (?)</li>
        <li>Filter Mask refinement (?)</li>
        <li>Add remaining space check</li>
        <li>Add check if package running</li>
        <li>Split progress/status bar into separate component</li>
        <li>Add debugging information</li>
        <li>Add logger page functionality</li>
        <li>Add advanced page functionality</li>
        <li>Add aggressive filtering with toggle-able option in advanced page</li>
      </ul>
    </div>
  )
}
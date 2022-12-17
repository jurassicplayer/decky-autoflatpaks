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
        <li>In-depth evaluation of found updates and update all button</li>
        <li>A How-To page with functionality explained in bite-sized chunks</li>
        <li>Add remaining space check</li>
        <li>Add check if package running</li>
        <li>Test and fix any bugginess with update all button and desyncing package list</li>
        <li>Fix the bugginess of touch navigation in the flatpak manager</li>
        <li>Flathub API integration (?)</li>
        <li>Add to Steam (?)</li>
        <li>Remove minutes option</li>
        <li>Filter Search refinement (?)</li>
        <li>Filter Mask refinement (?)</li>
        <li>Add debugging information</li>
        <li>Add advanced page functionality</li>
        <li>Add aggressive filtering with toggle-able option in advanced page</li>
        <li>Revise settings backend to reduce calls to python backend</li>
      </ul>
    </div>
  )
}
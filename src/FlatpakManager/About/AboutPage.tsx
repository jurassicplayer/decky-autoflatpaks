import { Focusable } from "decky-frontend-lib"
import { CSSProperties, useRef, VFC } from "react"
import { FaDownload, FaEye, FaEyeSlash, FaSyncAlt, FaTrashAlt } from "react-icons/fa"
import { ScrollPanel } from "../../InputControls/ScrollPanel"

export const AboutScrollPanel: CSSProperties = {
  height: "95%",
  minHeight: "95%",
  margin: "0px",
  borderRadius: "7px",
  display: "flex",
  justifyContent: "center",
  backgroundColor: "#121c25"
}
export const AboutContainer: CSSProperties = {
  margin: "20px 20px 0px 20px",
  paddingBottom: "15px",
  display: "flex",
  flexDirection: "column",
  minWidth: "95%"
}

export const AboutPage: VFC = () => {
  const scrollView = useRef<HTMLDivElement>(null)
  return (
    <ScrollPanel
      style={AboutScrollPanel}
      focusable={false}
      noFocusRing={true}
      onClick={()=> {scrollView.current?.focus()}}
      onOKButton={()=> {scrollView.current?.focus()}}>
      <Focusable
        style={AboutContainer}
        // @ts-ignore
        focusableIfNoChildren={true}
        noFocusRing={true}
        ref={scrollView}>
        <div>
          <h3 style={{margin: "0px"}}>Browse Page Navigation</h3>
          <p>
            The browse page houses a filter-able list of packages with button toggles and a single refresh button at the top. Each package row can be interacted with in a couple of ways:
            <ul>
              <li>Pressing Y: Brings up the options menu where filtering and sorting options are available</li>
              <li>Pressing X: Applies the queued actions to the console (package updates/installs/removals/etc)</li>
              <li>Pressing A on a package: Brings up a window with extra package information and description</li>
              <li><FaEye/> / <FaEyeSlash/>: Queues an action to mask or unmask the selected package</li>
              <li><FaSyncAlt/>: Queues an action to update the selected package</li>
              <li><FaDownload/> / <FaTrashAlt/>: Queues an action to install or uninstall the selected package</li>
            </ul>
          </p>
          <h3>Installing Packages from Flathub</h3>
          <p>
            Package installation/browsing (from flathub) is available by using the options menu and changing the status filter to either <b>All</b> OR <b>Not Installed</b>. While it is not required to have other filters, it is recommended to set any other desired filters first before setting the status filter to either option for a more seamless experience as all filters are applied instantly (except search) and will have a small momentary performance hit while re-filtering the full list.
          </p>
          <h3>Filters</h3>
          <p>
            There is a small set of filters available to help users find the packages they want to manage that is divided into 4 main categories:
            <ul>
              <li>Search: A searchbar with literal search (no fuzzy/relative searching)</li>
              <li>Type: All types, Applications, Runtimes</li>
              <li>Status: All statuses, Installed, Not Installed, Queued, Updateable</li>
              <li>Mask: All, Masked, Unmasked</li>
            </ul>
          </p>
          <h3>Masking Packages</h3>
          <p>
            Masking packages will prevent AutoFlatpaks from automatically updating/notifying about updates for the masked package as well as some of the dependencies (locale/debug packages). This allows users to keep a specific package version of applications without negatively impacting the user experience while auto-updating other packages and the masks WILL CARRY OVER to Discover as well.
          </p>

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
            <li>List unused packages (modal with list and remove unused button)</li>
            <li>List of masks from flatpak mask</li>
            <li>List of pins from flatpak pin</li>
            <li>Test and fix any bugginess with update all button and desyncing package list</li>
            <li>A How-To page with functionality explained in bite-sized chunks</li>
            <li>Add remaining space check</li>
            <li>Filter Search refinement (regex, fuzzy?)</li>
            <li>Add aggressive filtering with toggle-able option in advanced page</li>
            <li>Toggle-able FPM tabs (Logger, Advanced, About) option in advanced page</li>
            <li>Add advanced page functionality</li>
            <li>Backend persistent browse filter/sort options (?)</li>
            <li>Add check if package running (?)</li>
            <li>Flathub API integration (?)</li>
            <li>Add to Steam (?)</li>
            <li>Remove minutes option</li>
            <li>Filter Mask refinement (?)</li>
            <li>Add debugging information</li>
            <li>Revise settings backend to reduce calls to python backend</li>
          </ul>
        </div>
      </Focusable>
    </ScrollPanel>
  )
}
import { Focusable, ScrollPanel } from "decky-frontend-lib"
import { CSSProperties, useRef, VFC } from "react"
import { FaDownload, FaEye, FaEyeSlash, FaSyncAlt, FaTrashAlt } from "react-icons/fa"
import { SiGithub, SiKofi } from "react-icons/si"
import { SteamCssVariables } from "../../Utils/SteamUtils"

export const AboutScrollPanel: CSSProperties = {
  height: "95%",
  minHeight: "95%",
  margin: "0px",
  borderRadius: SteamCssVariables.gpCornerLarge,
  display: "flex",
  justifyContent: "center",
  backgroundColor: SteamCssVariables.gpBackgroundLightSofter
}
export const AboutContainer: CSSProperties = {
  margin: "20px 20px 0px 20px",
  paddingBottom: "15px",
  flexDirection: "column",
  minWidth: "95%",
  display: "flex"
}

export const AboutPage: VFC = () => {
  const scrollView = useRef<HTMLDivElement>(null)
  return (
    <ScrollPanel
      style={AboutScrollPanel}
      focusable={true}
      autoFocus={false}
      noFocusRing={true}
      onClick={()=> scrollView.current?.focus()}
      onOKButton={()=> scrollView.current?.focus()}
      onButtonDown={(e: CustomEvent)=> {
        if (e.detail.button == 10) scrollView.current?.focus()
      }}>
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
          <h3>QAM Navigation</h3>
          <p>
            The QAM panel menu houses the settings for notifications and automatic updates available for flatpaks and consists of 5 main elements:
            <ul>
              <li>An auto-hiding status bar showing various app states, including:
                <ul>
                  <li>queue progress</li>
                  <li>checking for updates</li>
                  <li>repairing packages</li>
                  <li>available updates (clickable)</li>
                </ul>
              </li>
              <li>A button bar to access the package manager, check for updates, and manually update all packages</li>
              <li>Settings for the interval of time to wait between automatic package checks</li>
              <li>Settings to check for updates on boot and automatically install available package updates</li>
              <li>Settings for notifications: Toast Only, Sound Only, Toast+Sound, or No Notification</li>
            </ul> 
          </p>
          <h3>Advanced Page</h3>
          <p>
            The Advanced page houses more complex and/or system altering functions that can be used to maintain and manage more intricate flatpak setups.
            <ul>
              <li>Aggressive Package Filtering: Hide packages on the Browse page that are irrelevant to most users, consisting of packages containing:
                <ul>
                  <li>BaseApp</li>
                  <li>BaseExtension</li>
                  <li>Debug</li>
                  <li>Sources</li>
                  <li>EoL (End of Life)</li>
                </ul>
              </li>
              <li>Default AppData Location: The default location where autoflatpak-installed flatpaks will place their appdata</li>
              <li>Migrate AppData: Moving flatpak appdata from one location to another</li>
              <li>Clean Unused Packages: List and remove packages as determined by the "flatpak remove --unused" command</li>
              <li>Repair Broken Packages: A proxy button to run the "flatpak repair" command</li>
            </ul>
          </p>
          <h3>AppData Locations</h3>
          <p>
            The AppData locations are per mounted device as exposed by SteamOS. By default, the standard location of flatpak appdata is available in the "~/.var/app" folder. In order to accomplish separate AppData install locations, symlinks leading to the actual location of each application's AppData is created on install (via AutoFlatpaks) as well as during AppData migration. These symlinks will not be removed on plugin removal and must either be reverted via AutoFlatpaks prior to plugin removal or manually reverted, BUT removing AutoFlatpaks will not cause any breakages to anything currently configured.
          </p>
          <h3>Social Media</h3>
          <ul>
            <li><SiGithub /> <a href="https://github.com/jurassicplayer">github.com/jurassicplayer</a></li>
            <li><SiKofi /> <a href="https://ko-fi.com/jurassicplayer">ko-fi.com/jurassicplayer</a></li>
          </ul>
          <br />
          <h2>Work In Progress</h2>
          <p>
            While AutoFlatpaks isn't intended to be a fully featured flatpak manager/store, it may end up being close, or even seen as one by some standards.<br />
            The final UI and features are not set in stone, and may be expanded upon/removed. The notes left in WIP pages are merely notes and ideas so I won't forget.<br />
            <br />
            This area will be a place to see information about the project including:<br />
          </p>
          <ul>
            <li>List of things I intend to fix/add/remove</li>
          </ul>
          <ul>
            <li>Convert FlatpakInfo modal to router page</li>
            <li>Add AppData migration to FlatpakInfo</li>
            <li>Flatseal-like permissions manager</li>
            <li>Visual glitching, more info on discord forum post (?)</li>
            <li>Persist highlighted button while scrolling package list (?)</li>
            <li>Add check for network connectivity before continuing intervalcheck (?)</li>
            <li>Add remaining space check</li>
            <li>Move logger into Advanced tab (?)</li>
            <li>Move QAM settings to Advanced tab (?)</li>
            <li>Filter Search refinement (regex, fuzzy?)</li>
            <li>A How-To page with functionality explained in bite-sized chunks</li>
            <li>Add to Steam (?)</li>
            <li>Remove minutes option</li>
            <li>Revise settings backend to reduce calls to python backend</li>
            <li>Backend persistent browse filter/sort options (?)</li>
            <li>Filter advanced mask refinement (?)</li>
            <li>Flathub API integration (x)</li>
            <li>List of masks from flatpak mask (x)</li>
            <li>List of pins from flatpak pin (x)</li>
          </ul>
        </div>
      </Focusable>
    </ScrollPanel>
  )
}
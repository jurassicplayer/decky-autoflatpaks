import { findModuleChild, Module } from "decky-frontend-lib"
import { Backend } from "./Backend";
import { Settings } from "./Settings";

//#region Find SteamOS modules
const findModule = (property: string) => {
  return findModuleChild((m: Module) => {
    if (typeof m !== "object") return undefined;
    for (let prop in m) {
      try {
        if (m[prop][property])
          return m[prop]
      } catch {
        return undefined
      }
    }
  })
}
const NavSoundMap = findModule("ToastMisc");
//#endregion

export class SteamUtils {
  //#region Notification Wrapper
  static async notify(title: string, message: string, showToast?: boolean, playSound?: boolean, sound?: number, duration?: number) {
    if (sound === undefined ) sound = NavSoundMap?.ToastMisc // Not important, could pass the actual number instead (6)
    if (playSound === undefined ) playSound = Settings.playSound
    if (showToast === undefined ) showToast = Settings.showToast
    let toastData = {
      title: title,
      body: message,
      duration: duration,
      sound: sound,
      playSound: playSound,
      showToast: showToast
    }
    Backend.getServer().toaster.toast(toastData)
  }
}

interface AppEntry {
  nAppID: number
  rtLastPlayed: number
  strAppName: string
  strDLCSize: string
  strSortAs: string
  strStagedSize: string
  strUsedSize: string
  strWorkshopSize: string
}

export interface InstallFolderEntry {
  bIsDefaultFolder: boolean
  bIsFixed: boolean
  bIsMounted: boolean
  nFolderIndex: number
  strCapacity: string
  strDLCSize: string
  strDriveName: string
  strFolderPath: string
  strFreeSpace: string
  strStagedSize: string
  strUsedSize: string
  strUserLabel: string
  strWorkshopSize: string
  vecApps: AppEntry[]
}

export class SteamCssVariables {
  static basicuiHeaderHeight = "var(--basicui-header-height)"                                   // 0px
  static stickyHeaderBackgroundOpacity = "var(--sticky-header-background-opacity)"              // 0
  static gamepadPageContentMaxWidth = "var(--gamepad-page-content-max-width)"                   // 1100px
  static scrollFadeSize = "var(--scroll-fade-size)"                                             // 20px
  
  static virtualmenuAccent = "var(--virtualmenu-accent)"                                        // #1a9fff
  static virtualmenuBg = "var(--virtualmenu-bg)"                                                // #1f1f1f
  static virtualmenuBgHover = "var(--virtualmenu-bg-hover)"                                     // #103753
  static virtualmenuFg = "var(--virtualmenu-fg)"                                                // #ffffff
  static virtualmenutouchkeyIconWidth = "var(--virtualmenutouchkey-icon-width)"                 // 100%
  static virtualmenutouchkeyIconHeight = "var(--virtualmenutouchkey-icon-height)"               // 100%
  static virtualmenupointerX = "var(--virtualmenupointer-x)"                                    // 0%
  static virtualmenupointerY = "var(--virtualmenupointer-y)"                                    // 0%
  static virtualmenupointerColor = "var(--virtualmenupointer-color)"                            // #1a9fff
  static virtualmenutouchkeyMidpointX = "var(--virtualmenutouchkey-midpoint-x)"                 // 0%
  static virtualmenutouchkeyMidpointY = "var(--virtualmenutouchkey-midpoint-y)"                 // 0%
  static virtualmenutouchkeyDescriptionWidth = "var(--virtualmenutouchkey-description-width)"   // 0px

  static touchmenuiconFg = "var(--touchmenuicon-fg)"                                            // #b8bcbf
  static touchmenuiconBg = "var(--touchmenuicon-bg)"                                            // #1f1f1f
  static touchmenuiconScale = "var(--touchmenuicon-scale)"                                      // 1

  static indentLevel = "var(--indent-level)"                                                    // 0
  static fieldNegativeHorizontalMargin = "var(--field-negative-horizontal-margin)"              // 0px
  static fieldRowChildrenSpacing = "var(--field-row-children-spacing)"                          // 0px

  static mainTextColor = "var(--main-text-color)"                                               // #dbe2e6
  static mainLightBlueBackground = "var(--main-light-blue-background)"                          // #93b3c8
  static mainTextOnLightBlue = "var(--main-text-on-light-blue)"                                 // #d1d1d1
  static mainTopImageBg = "var(--main-top-image-bg)"                                            // #1f2126
  static mainEditorBgColor = "var(--main-editor-bg-color)"                                      // #363a43
  static mainEditorTextColor = "var(--main-editor-text-color)"                                  // #e6e7e8
  static mainEditorInputBgColor = "var(--main-editor-input-bg-color)"                           // #30333b
  static mainEditorSectionTitleColor = "var(--main-editor-section-title-color)"                 // #a3a3a3

  static gpSystemLightestGrey = "var(--gpSystemLightestGrey)"                                   // #DCDEDF
  static gpSystemLighterGrey = "var(--gpSystemLighterGrey)"                                     // #B8BCBF
  static gpSystemLightGrey = "var(--gpSystemLightGrey)"                                         // #8B929A
  static gpSystemGrey = "var(--gpSystemGrey)"                                                   // #67707B
  static gpSystemDarkGrey = "var(--gpSystemDarkGrey)"                                           // #3D4450
  static gpSystemDarkerGrey = "var(--gpSystemDarkerGrey)"                                       // #23262E
  static gpSystemDarkestGrey = "var(--gpSystemDarkestGrey)"                                     // #0E141B
  static gpStoreLightestGrey = "var(--gpStoreLightestGrey)"                                     // #CCD8E3
  static gpStoreLighterGrey = "var(--gpStoreLighterGrey)"                                       // #A7BACC
  static gpStoreLightGrey = "var(--gpStoreLightGrey)"                                           // #7C8EA3
  static gpStoreGrey = "var(--gpStoreGrey)"                                                     // #4e697d
  static gpStoreDarkGrey = "var(--gpStoreDarkGrey)"                                             // #2A475E
  static gpStoreDarkerGrey = "var(--gpStoreDarkerGrey)"                                         // #1B2838
  static gpStoreDarkestGrey = "var(--gpStoreDarkestGrey)"                                       // #000F18
  static gpGradientStoreBackground = "var(--gpGradient-StoreBackground)"                        // linear-gradient(180deg, var(--gpStoreDarkGrey) 0%, var(--gpStoreDarkerGrey) 80%)
  static gpGradientLibraryBackground = "var(--gpGradient-LibraryBackground)"                    // radial-gradient(farthest-corner at 40px 40px,#3D4450 0%, #23262E 80%)
  static gpColorBlue = "var(--gpColor-Blue)"                                                    // #1A9FFF
  static gpColorBlueHi = "var(--gpColor-BlueHi)"                                                // #00BBFF
  static gpColorGreen = "var(--gpColor-Green)"                                                  // #5ba32b
  static gpColorGreenHi = "var(--gpColor-GreenHi)"                                              // #59BF40
  static gpColorOrange = "var(--gpColor-Orange)"                                                // #E35E1C
  static gpColorRed = "var(--gpColor-Red)"                                                      // #D94126
  static gpColorRedHi = "var(--gpColor-RedHi)"                                                  // #EE563B
  static gpColorDustyBlue = "var(--gpColor-DustyBlue)"                                          // #417a9b
  static gpColorLightBlue = "var(--gpColor-LightBlue)"                                          // #B3DFFF
  static gpColorYellow = "var(--gpColor-Yellow)"                                                // #FFC82C
  static gpColorChalkyBlue = "var(--gpColor-ChalkyBlue)"                                        // #66C0F4
  static gpBackgroundLightSofter = "var(--gpBackground-LightSofter)"                            // #6998bb24
  static gpBackgroundLightSoft = "var(--gpBackground-LightSoft)"                                // #3b5a7280
  static gpBackgroundLightMedium = "var(--gpBackground-LightMedium)"                            // #678BA670
  static gpBackgroundLightHard = "var(--gpBackground-LightHard)"                                // #93B8D480
  static gpBackgroundLightHarder = "var(--gpBackground-LightHarder)"                            // #aacce6a6
  static gpBackgroundDarkSofter = "var(--gpBackground-DarkSofter)"                              // #0e141b33
  static gpBackgroundDarkSoft = "var(--gpBackground-DarkSoft)"                                  // #0e141b66
  static gpBackgroundDarkMedium = "var(--gpBackground-DarkMedium)"                              // #0e141b99
  static gpBackgroundDarkHard = "var(--gpBackground-DarkHard)"                                  // #0e141bcc
  static gpBackgroundNeutralLightSofter = "var(--gpBackground-Neutral-LightSofter)"             // #ebf6ff1a
  static gpBackgroundNeutralLightSoft = "var(--gpBackground-Neutral-LightSoft)"                 // #ebf6ff33
  static gpBackgroundNeutralLightMedium = "var(--gpBackground-Neutral-LightMedium)"             // #ebf6ff4d
  static gpBackgroundNeutralLightHard = "var(--gpBackground-Neutral-LightHard)"                 // #ebf6ff66
  static gpBackgroundNeutralLightHarder = "var(--gpBackground-Neutral-LightHarder)"             // #ebf6ff80
  static gpCornerSmall = "var(--gpCorner-Small)"                                                // 1px
  static gpCornerMedium = "var(--gpCorner-Medium)"                                              // 2px
  static gpCornerLarge = "var(--gpCorner-Large)"                                                // 3px
  static gpSpaceGutter = "var(--gpSpace-Gutter)"                                                // 24px
  static gpSpaceGap = "var(--gpSpace-Gap)"                                                      // 12px
  static gpNavWidth = "var(--gpNavWidth)"                                                       // 240px
  static gpPaymentsNavWidth = "var(--gpPaymentsNavWidth)"                                       // 340px
  static gpDselectWidth = "var(--gpDselectWidth)"                                               // 340px
  static gpSidePanelWidth = "var(--gpSidePanelWidth)"                                           // 340px
  static gpGiftingPanelWidth = "var(--gpGiftingPanelWidth)"                                     // 280px
  static gpCommunityRightPanelWidth = "var(--gpCommunityRightPanelWidth)"                       // 320px
  static gpVerticalResponsivePaddingSmall = "var(--gpVerticalResponsivePadding-Small)"          // calc( (100vw - 854px) / 60 )
  static gpVerticalResponsivePaddingMedium = "var(--gpVerticalResponsivePadding-Medium)"        // calc( (100vw - 854px) / 20 )
  static gpVerticalResponsivePaddingLarge = "var(--gpVerticalResponsivePadding-Large)"          // calc( (100vw - 854px) / 12 )
  static gpScreenWidth = "var(--screen-width)"                                                  // 100vw
  static gpWidth6colcap = "var(--gpWidth-6colcap)"                                              // calc((var(--screen-width) - (5 * var(--gpSpace-Gap)) - (2 * var(--gpSpace-Gutter))) / 6)
  static gpWidth5colcap = "var(--gpWidth-5colcap)"                                              // calc((var(--screen-width) - (4 * var(--gpSpace-Gap)) - (2 * var(--gpSpace-Gutter))) / 5)
  static gpWidth4colcap = "var(--gpWidth-4colcap)"                                              // calc((var(--screen-width) - (3 * var(--gpSpace-Gap)) - (2 * var(--gpSpace-Gutter))) / 4)
  static gpWidth3colcap = "var(--gpWidth-3colcap)"                                              // calc((var(--screen-width) - (2 * var(--gpSpace-Gap)) - (2 * var(--gpSpace-Gutter))) / 3)
  static gpWidth2colcap = "var(--gpWidth-2colcap)"                                              // calc((var(--screen-width) - (1 * var(--gpSpace-Gap)) - (2 * var(--gpSpace-Gutter))) / 2)
  static gpWidth1colcap = "var(--gpWidth-1colcap)"                                              // calc((var(--screen-width) - (2 * var(--gpSpace-Gutter))))
  static gpStoreMenuHeight = "var(--gpStoreMenuHeight)"                                         // 58px
  static gpShadowSmall = "var(--gpShadow-Small)"                                                // 0px 2px 2px 0px #0000003D
  static gpShadowMedium = "var(--gpShadow-Medium)"                                              // 0px 3px 6px 0px #0000003D
  static gpShadowLarge = "var(--gpShadow-Large)"                                                // 0px 12px 16px 0px #0000003D
  static gpShadowXLarge = "var(--gpShadow-XLarge)"                                              // 0px 24px 32px 0px #0000003D
  static gpTextHeadingLarge = "var(--gpText-HeadingLarge)"                                      // normal 700 26px/1.4 "Motiva Sans", Arial, Sans-serif
  static gpTextHeadingMedium = "var(--gpText-HeadingMedium)"                                    // normal 700 22px/1.4 "Motiva Sans", Arial, Sans-serif
  static gpTextHeadingSmall = "var(--gpText-HeadingSmall)"                                      // normal 700 18px/1.4 "Motiva Sans", Arial, Sans-serif
  static gpTextBodyLarge = "var(--gpText-BodyLarge)"                                            // normal 400 16px/1.4 "Motiva Sans", Arial, Sans-serif
  static gpTextBodyMedium = "var(--gpText-BodyMedium)"                                          // normal 400 14px/1.4 "Motiva Sans", Arial, Sans-serif
  static gpTextBodySmall = "var(--gpText-BodySmall)"                                            // normal 400 12px/1.4 "Motiva Sans", Arial, Sans-serif

  // Custom shared CSS
  static customTransparent = "#fff0" // Transparent
  static customStatusGreen = "#0b6f4c"
  static customStatusYellow = "#9c8f40"
  static customStatusRed = "#7a0a0a"
  static customSpinnerBgColor = "#0c1519"
}

import { CSSProperties } from "react";
export const emphasis: CSSProperties = {
  background: SteamCssVariables.gpBackgroundNeutralLightSoft,
  borderRadius: SteamCssVariables.gpCornerLarge,
  padding: '0px 6px 1px 6px',
  color: SteamCssVariables.mainTextColor
}
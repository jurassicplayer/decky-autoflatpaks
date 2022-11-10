import { JsonObject, JsonProperty, JsonSerializer } from 'typescript-json-serializer';

const SETTINGS_KEY = "AutoFlatpaks";

const serializer = new JsonSerializer();

@JsonObject()
export class Settings {
  @JsonProperty()
  notificationEnabled: boolean = false;
  @JsonProperty()
  soundEnabled: boolean = false;
  @JsonProperty()
  checkOnBootEnabled: boolean = false;
  @JsonProperty()
  unattendedUpgradesEnabled: boolean = false;
  @JsonProperty()
  updateInterval: number = 720; // 12 hours in minutes
  @JsonProperty()
  lastCheckTimestamp: Date = new Date();
}

export function loadSettingsFromLocalStorage(): Settings {
  const settingsString = localStorage.getItem(SETTINGS_KEY) || "{}";
  const settingsJson = JSON.parse(settingsString);
  const settings = serializer.deserializeObject(settingsJson, Settings);
  // console.log('Read from local storage: '+settingsString);
  return settings || new Settings();
}

export function saveSettingsToLocalStorage(settings: Settings ) {
  const settingsJson = serializer.serializeObject(settings) || {};
  const settingsString = JSON.stringify(settingsJson);
  localStorage.setItem(SETTINGS_KEY, settingsString);
  // console.log('Wrote to local storage: '+settingsString);
}



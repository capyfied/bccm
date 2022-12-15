import { assertType } from "@/util/validations.js"

// This class stores all user settings.
export default class Settings {
  static DEFAULT_SETTINGS = {
    confirmCraftDeletion: true
  };
  static KEYS = Object.keys(Settings.DEFAULT_SETTINGS);

  constructor() {
    this.loadJson(Settings.DEFAULT_SETTINGS);
  }
  // Generate a new Settings object from the provided JSON.
  static fromJson(json) {
    const settings = new Settings();
    settings.loadJson(json);
    return settings;
  }
  // Load the settings from a JSON into this Settings object.
  loadJson(json) {
    if (typeof(json) == "string") json = JSON.parse(json);
    const defaultSettings = Settings.DEFAULT_SETTINGS;
    for (let settingName of Settings.KEYS) {
      if (json[settingName] !== undefined) {
        this[settingName] = json[settingName];
      } else {
        console.warn(`Missing field '${settingName}' in loaded settings, using default.`);
        this[settingName] = defaultSettings[settingName];
      }
    }
    this.validate();
  }
  // Convert this object into a JSON for storage.
  toJson() {
    const json = {};
    Settings.KEYS.forEach(key => { json[key] = this[key]; });
    return json;
  }
  // Check that all the settings are valid.
  validate() {
    assertType(this, 'confirmCraftDeletion', 'boolean');
  }
}

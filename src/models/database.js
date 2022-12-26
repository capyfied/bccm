import Folder from "@/models/folder.js";
import Settings from "@/models/settings.js";
import Importer from "@/util/importer.js";
import { debounce, ellipsize, renameObjectsToMakeThemUnique } from "@/util/util.js";

// This class contains all the user data.
export default class Database {
  rootFolder = null; // [Folder] The root-level folder, which contains all crafts and subfolders.
  settings = null; // [Settings] The user settings for this database.

  constructor() {
    this.saveToLocalStorageWithDebounce = debounce(() => this.saveToLocalStorage(), 1000); // Features that might be used in quick succession can call this instead of saveToLocalStorage() for better performance.
    if (window.localStorage.database) {
      try {
        this.deserialize(window.localStorage.database);
      } catch(e) {
        window.localStorage.failed = window.localStorage.database;
        console.error(`Error loading saved database: ${e.message}. Copying old database to localStorage.failed and resetting.`);
        this.reset();
      }
    } else {
      this.reset();
    }
  }
  // Remove all data from the database and restore it to its default state.
  reset() {
    this.rootFolder = new Folder("Crafted items");
    this.settings = new Settings();
    this.saveToLocalStorage();
  }
  // Add a list of Crafts to the root folder of this database.
  addCrafts(newCrafts) {
    let stats = { new: 0, edited: 0, failed: 0 }
    const allCrafts = this.rootFolder.findAllCrafts();
    // If there are multiple crafts with the same name among the imported crafts, rename them so that all names are unique.
    renameObjectsToMakeThemUnique(newCrafts);
    // Now, go craft by craft and import them.
    for (let craft of newCrafts) {
      try {
        craft.parent = this.rootFolder;
        craft.validate();
      } catch(e) {
        console.warn(`Skipping invalid craft "${craft.name}": ${e.message}"`);
        stats.failed++;
        continue;
      }
      // If there's already a craft with the same name, update it instead of creating a new one.
      const existingCraft = allCrafts.find(c => c.name == craft.name);
      if (existingCraft) {
        Object.assign(existingCraft, craft);
        stats.edited++;
      } else {
        craft.parent = this.rootFolder;
        this.rootFolder.crafts.push(craft);
        stats.new++;
      }
    }
    this.saveToLocalStorage();
    stats.total = stats.new + stats.edited + stats.failed;
    return stats;
  }
  // Delete a Craft from the database
  removeCraft(craft) {
    craft.parent.crafts = craft.parent.crafts.filter(c => c != craft);
    this.saveToLocalStorageWithDebounce();
  }
  // Move a Craft to a different Folder. For changing its position within the parent Folder, see Craft.move() instead.
  moveCraft(craft, targetFolder) {
    const sourceFolder = craft.parent;
    if (sourceFolder != targetFolder) {
      sourceFolder.crafts = sourceFolder.crafts.filter(it => it != craft);
      targetFolder.crafts.push(craft);
      craft.parent = targetFolder;
    }
    this.saveToLocalStorage();
  }
  // Move a Folder to a different Folder. For changing its position within the parent Folder, see Folder.move() instead.
  moveFolder(movingFolder, newParent) {
    if (!movingFolder.parent) throw new MoveError("Cannot move the root folder.");
    if (movingFolder == newParent) throw new MoveError("Cannot move folder into itself.");
    if (newParent == movingFolder.parent) return;
    if (newParent.isWithin(movingFolder)) throw new MoveError("Cannot move a folder into one of its descendents.");
    const oldParent = movingFolder.parent;
    oldParent.subfolders = oldParent.subfolders.filter(sf => sf != movingFolder);
    movingFolder.parent = newParent;
    newParent.subfolders.push(movingFolder);
  }
  // Create a new Folder as a child of the provided parent Folder
  addFolder(parent, name) {
    const newFolder = new Folder(name, parent);
    parent.subfolders.push(newFolder);
    this.saveToLocalStorage();
    return newFolder;
  }
  // Delete a Folder from the database.
  removeFolder(folder) {
    if (folder.parent) {
      folder.parent.subfolders = folder.parent.subfolders.filter(sf => sf != folder);
      this.saveToLocalStorage();
    } else throw "Cannot delete root folder.";
  }
  // Import Crafts from the provided string, which can be in any of the supported formats.
  importCrafts(stringToImport) {
    return this.addCrafts(Importer.convertStringToCrafts(stringToImport));
  }
  // Serialize this database to be stored in localStorage.
  serialize() {
    return JSON.stringify({
      version: 1,
      rootFolder: this.rootFolder.toJson(),
      settings: this.settings.toJson()
    })
  }
  // Replace the contents of the current database with the ones in the provided JSON.
  deserialize(json) {
    if (!json) {
      throw new DeserializationError("No data to process.");
    }
    if (typeof(json) == "string") {
      try {
        json = JSON.parse(json);
      } catch(e) {
        throw new DeserializationError(`The provided text is not valid JSON: "${ellipsize(json, 10)}"`);
      }
    }
    try {
      if (json.rootFolder) {
        this.rootFolder = Folder.fromJson(json.rootFolder);
      } else {
        throw new DeserializationError("Parsed JSON does not contain rootFolder attribute.");
      }
    } catch(e) {
      throw new DeserializationError("Unexpected error when deserializing crafts: " + e);
    }
    try {
      if (json.settings) {
        this.settings = Settings.fromJson(json.settings);
      } else {
        throw new DeserializationError("Parsed JSON does not contain settings attribute.");
      }
    } catch(e) {
      console.warn("Unexpected error when deserializing settings, using defaults instead. Reason: " + e);
      this.settings = new Settings();
    }
    return this;
  }
  // Persist the database in the browser's Local Storage.
  saveToLocalStorage() {
    window.localStorage.database = this.serialize();
  }
  // Return how many crafts there are in total in the database.
  findCraftCount() {
    return this.rootFolder.findAllCrafts().length;
  }
  // If there is any craft that shares name with another, return its name. Otherwise, return null.
  findRepeatedCraftName() {
    return this.rootFolder.findAllCrafts().map(c => c.name).filter((craft, idx, arr) => arr.indexOf(craft) !== idx)[0] || null;
  }
}
// Error thrown whenever the user attempts to import data from clipboard or a text file, but the format or contents are invalid.
class DeserializationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DeserializationError";
  }
}
// Error thrown whenever the user tries to move a craft or folder to an invalid location.
class MoveError extends Error {
  constructor(message) {
    super(message);
    this.name = "MoveError";
  }
}

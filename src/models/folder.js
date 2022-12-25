import BCImportCommandFormat from "@/util/formats/bcImportCommandFormat.js";
import Craft from "@/models/craft.js";
import { generateUuid, swap } from "@/util/util.js";

// This class represents a folder in which we can hierarchically organize Crafts.
export default class Folder {
  uuid = null; // [String] Internal identifier for this folder.
  name = null; // [String] User-provided name.
  parent = null; // [Folder] The parent of this folder, or null if it's the root folder.
  subfolders = null; // [Array of Folder] A list of all the direct subfolders.
  crafts = null; // [Array of Craft] A list of all the crafts in this folder (but not subfolders).
  collapsed = null; // [Boolean] Whether this folder is expanded or collapsed in the explorer.
  isFolder = true; // [Boolean] Way to discriminate between Crafts and Folders for some methods that can take either object.

  constructor(name, parent) {
    this.uuid = generateUuid();
    this.name = name;
    this.parent = parent;
    this.subfolders = [];
    this.crafts = [];
    this.collapsed = false;
  }
  // Return an array of all the crafts contained within this folder and its subfolders.
  findAllCrafts() {
    return this.crafts.concat(...this.subfolders.map(sf => sf.findAllCrafts()));
  }
  // Given the UUID of a craft, try to find it in this and all subfolders.
  findCraft(uuid) {
    let craftFound = this.crafts.find(craft => craft.uuid == uuid);
    if (craftFound) return craftFound;
    for (let subfolder of this.subfolders) {
      craftFound = subfolder.findCraft(uuid);
      if (craftFound) return craftFound;
    }
    return false;
  }
  // Given the UUID of a folder, try to find it among all the descendents of this one.
  findFolder(uuid) {
    if (this.uuid == uuid) return this;
    return this.subfolders.reduce((found, sf) => found || sf.findFolder(uuid), null);
  }
  // Convert this folder into a plain JSON to be persisted.
  toJson() {
    return {
      uuid: this.uuid,
      name: this.name,
      subfolders: this.subfolders.map(sf => sf.toJson()),
      crafts: this.crafts.map(it => it.toJson()),
      collapsed: this.collapsed
    }
  }
  // Return true if this folder contains nothing at all, neither crafts nor subfolders.
  isEmpty() {
    return this.crafts.length == 0 && this.subfolders.length == 0;
  }
  // Return true if this folder is contained within the parameter folder, or if it is the same one.
  isWithin(folder) {
    return folder == this || (this.parent ? this.parent.isWithin(folder) : false);
  }
  // Return an array containing all ancestor folders in order, plus this one itself.
  getAncestry() {
    return this.parent ? this.parent.getAncestry().concat([this]) : [this];
  }
  // Create a folder out of a plain JSON that was persisted
  static fromJson(json, parent = null) {
    const f = new Folder();
    f.uuid = json.uuid;
    f.name = json.name,
    f.parent = parent;
    f.subfolders = json.subfolders.map(subfolderJson => Folder.fromJson(subfolderJson, f));
    f.crafts = (json.crafts).map(craftJson => Craft.fromJson(craftJson, f));
    f.collapsed = json.collapsed;
    return f;
  }
  // Convert all the crafts in this folder into a command the user can run on BC to import them all
  toBCImportCommand() {
    return BCImportCommandFormat.convertCraftsToBCImportCommand(this.findAllCrafts());
  }
  // Move this folder up or down among its siblings. For moving to a different folder, see Database.moveFolder().
  move(direction) {
    const idx = this.parent.subfolders.indexOf(this);
    if (idx == -1) throw "Could not find subfolder";
    if (direction == "down" && idx < this.parent.subfolders.length - 1) {
      swap(this.parent.subfolders, idx, idx + 1);
    } else if (direction == "up" && idx > 0) {
      swap(this.parent.subfolders, idx, idx - 1);
    } else {
      console.warn(`Cannot move folder ${this.name} (${idx}) ${direction}`);
    }
  }
  // Return true if this folder or any of its descendents match the given query.
  matchesQuery(query) {
    return this.name.toLowerCase().includes(query) ||
      this.crafts.some(c => c.matchesQuery(query)) ||
      this.subfolders.some(sf => sf.matchesQuery(query))
  }
}

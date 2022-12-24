import BCJsonFormat from "@/util/formats/bcJsonFormat.js";
import { swap } from "@/util/util.js";
import { assert, assertType } from "@/util/validations.js"

// This class is our internal representation for a crafted item.
export default class Craft {
  static NAME_MAX_LENGTH = 30; // Character limit of the name field.
  static DESCR_MAX_LENGTH = 100; // Character limit of the description field.
  uuid = null; // [String] Internal identifier for this craft.
  parent = null; // [Folder] The Folder this craft belongs to.
  item = null; // [String] The codename of the item this craft is based on.
  property = null; // [String] Which special property the craft has, if any.
  lock = null; // [String] Which lock the craft uses, if any.
  name = null; // [String] The user-supplied name for the craft.
  description = null; // [String] The user-supplied description for the craft.
  color = null; // [String] A comma-separated list of hex values corresponding to the craft's colors.
  private = null; // [Boolean] Whether the craft can be used by other players.
  type = null; // [String] An item-specific identifier for the default variant/position of the item to be used.

  // Convert a JSON into an Craft (this is the format we use for localStorage).
  static fromJson(json, parent = null) {
    if (!json || !parent) throw "Missing argument";
    const craft = new Craft();
    craft.uuid = json.uuid;
    craft.parent = parent;
    craft.item = json.item;
    craft.property = json.property;
    craft.lock = json.lock;
    craft.name = json.name;
    craft.description = json.description;
    craft.color = json.color;
    craft.private = json.private == true;
    craft.type = json.type;
    craft.priority = json.priority;
    return craft;
  }
  // Convert this Craft into a JSON (this is the format we use for localStorage).
  toJson() {
    return {
      uuid: this.uuid,
      item: this.item,
      property: this.property,
      lock: this.lock,
      name: this.name,
      description: this.description,
      color: this.color,
      private: this.private,
      type: this.type,
      priority: this.priority
    }
  }
  // Ensure all the data in this Craft is valid, throwing an error if it isn't
  validate() {
    assertType(this, 'uuid', 'string');
    assertType(this, 'parent', 'object');
    assertType(this, 'item', 'string');
    assertType(this, 'property', 'string', false);
    assertType(this, 'lock', 'string', false);
    assertType(this, 'name', 'string');
    assertType(this, 'description', 'string', false);
    assertType(this, 'color', 'string', false);
    assertType(this, 'private', 'boolean');
    assertType(this, 'type', 'string', false);
    assertType(this, 'priority', 'number', false);
    assert(this.priority === null || Number.isInteger(this.priority), "Priority must be an integer.");
    assert(this.name.length > 0 && this.name.length <= Craft.NAME_MAX_LENGTH, `Name must be between 1 and ${Craft.NAME_MAX_LENGTH} characters.`);
    assert(this.name.length <= Craft.DESCR_MAX_LENGTH, `Description must be under ${Craft.DESCR_MAX_LENGTH} characters.`);
  }
  // Move this craft up or down among its siblings. For moving to a different folder, see Database.moveCraft().
  move(direction) {
    const idx = this.parent.crafts.indexOf(this);
    if (idx == -1) throw "Could not find craft";
    if (direction == "down" && idx < this.parent.crafts.length - 1) {
      swap(this.parent.crafts, idx, idx + 1);
    } else if (direction == "up" && idx > 0) {
      swap(this.parent.crafts, idx, idx - 1);
    } else {
      console.warn(`Cannot move craft ${this.name} (${idx}) ${direction}`);
    }
  }
  // Return true if this folder or any of its descendents match the given query.
  matchesQuery(query) {
    return this.name.toLowerCase().includes(query) || this.item.toLowerCase().includes(query);
  }
  // Convenience methods for encoding/decoding.
  static fromCompressedBCJson(base64String) { return BCJsonFormat.convertCompressedBCJsonToCraft(base64String); }
  static fromBCJson(bcJson) { return BCJsonFormat.convertBCJsonToCraft(bcJson); }
  toBCJson() { return BCJsonFormat.convertCraftToBCJson(this); }
  toCompressedBCJson() { return BCJsonFormat.convertCraftToCompressedBCJson(this); }
}

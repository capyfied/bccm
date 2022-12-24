import LZString from "lz-string";
import Craft from "@/models/craft.js";
import { generateUuid } from "@/util/util.js";

export default class BCJsonFormat {
  // Convert our internal craft format into the BC craft format.
  static convertCraftToBCJson(craft) {
    return {
      Item: craft.item,
      Property: craft.property,
      Lock: craft.lock,
      Name: craft.name,
      Description: craft.description,
      Color: craft.color,
      Private: craft.private,
      Type: craft.type,
      OverridePriority: craft.priority
    }
  }
  // Convert our internal craft format into the compressed BC craft format used by FBC.
  static convertCraftToCompressedBCJson(craft) {
    return LZString.compressToBase64(JSON.stringify(craft.toBCJson()));
  }
  // Same as above, but for an array of Crafts. This format is not used by the game or FBC, but it's handy to share crafts within BCCM.
  static convertCraftsToCompressedBCJsons(crafts) {
    return LZString.compressToBase64(JSON.stringify(crafts.map(c => c.toBCJson())));
  }
  // Convert the BC craft format into our internal BC format.
  static convertBCJsonToCraft(bcJson) {
    const craft = new Craft();
    craft.uuid = generateUuid();
    craft.item = bcJson.Item;
    craft.property = bcJson.Property;
    craft.lock = bcJson.Lock;
    craft.name = bcJson.Name;
    craft.description = bcJson.Description;
    craft.color = bcJson.Color;
    craft.private = bcJson.Private == true;
    craft.type = bcJson.Type;
    craft.priority = bcJson.OverridePriority;
    return craft;
  }
  // Convert a compressed BC JSON (exported by FBC) into our internal craft format.
  static convertCompressedBCJsonToCraft(base64String) {
    return this.convertBCJsonToCraft(JSON.parse(LZString.decompressFromBase64(base64String)));
  }
}

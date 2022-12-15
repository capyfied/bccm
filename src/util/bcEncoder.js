import LZString from "lz-string";
import Craft from "@/models/craft.js";
import Database from "@/models/database.js";
import { generateUuid } from "@/util/util.js";

// This module handles all conversions of our crafts into the formats used by BC/FBC, and vice-versa.
export default class BCEncoder {
  static maxCraftsExportable = 40; // The limit on how many crafts can be exported at once, due to BC limitations.
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
  // Convert a list of Crafts into a command the user can run on BC to import them all.
  static convertCraftsToBCImportCommand(crafts) {
    const dataString = this.convertCraftsToBCDataString(crafts.map(craft => craft.toBCJson()));
    return `CraftingLoadServer("${dataString.replace(/"/g, '\\"')}")`;
  }
  // Convert a list of BC craft JSONs into a compressed, UTF-encoded string that's used by BC to store all the player's crafts on the backend.
  // See BC's Crafting.js:CraftingSaveServer().
  static convertCraftsToBCDataString(crafts) {
    if (!crafts) throw "No crafts to encode.";
    if (crafts.length > this.maxCraftsExportable) throw new ExportLimitError();
    let str = "";
    for (let craft of crafts) {
      if ((craft != null) && (craft.Item != null) && (craft.Item != "")) {
        str = str + craft.Item + "¶";
        str = str + ((craft.Property == null) ? "" : craft.Property) + "¶";
        str = str + ((craft.Lock == null) ? "" : craft.Lock) + "¶";
        str = str + ((craft.Name == null) ? "" : craft.Name.replace("¶", " ").replace("§", " ")) + "¶";
        str = str + ((craft.Description == null) ? "" : craft.Description.replace("¶", " ").replace("§", " ")) + "¶";
        str = str + ((craft.Color == null) ? "" : craft.Color.replace("¶", " ").replace("§", " ")) + "¶";
        str = str + (((craft.Private != null) && craft.Private) ? "T" : "") + "¶";
        str = str + ((craft.Type == null) ? "" : craft.Type.replace("¶", " ").replace("§", " ")) + "¶";
        str = str + ((craft.OverridePriority == null) ? "" : craft.OverridePriority.toString()) + "§";
      } else {
        str = str + "§";
      }
    }
    while ((str.length >= 1) && (str.substring(str.length - 1) == "§")) {
      str = str.substring(0, str.length - 1);
    }
    return LZString.compressToUTF16(str);
  }
  // Convert a user-provided string in any supported format into a list of Crafts. Formats supported are:
  // 1) BCCM database export (or array thereof)
  // 2) BCCM craft JSON (or array thereof)
  // 3) BC craft JSON (or array thereof)
  // 4) BC compressed craft JSON (or whitespace-separated list thereof)
  static convertStringToCrafts(stringToImport) {
    if (!stringToImport) throw new ImportError("No data to import.");
    stringToImport = stringToImport.trim();
    if (stringToImport[0] == "{" || stringToImport[0] == "[") {
      let json;
      try {
        json = JSON.parse(stringToImport);
      } catch (e) {
        throw new ImportError("JSON", `The provided text is not valid JSON: "${stringToImport.length > 10 ? `${stringToImport.substr(0, 9)}...` : stringToImport}"`);
      }
      if (Array.isArray(json)) {
        return json.map(c => this.convertAnyJSONToCrafts(c)).flat().filter(e => e != null);
      } else {
        return this.convertAnyJSONToCrafts(json);
      }
    }
    try {
      const codes = stringToImport.replace(/[^a-zA-Z0-9=+/]+/g, " ").split(" ").filter(s => s.length > 0);
      return codes.map(c => Craft.fromCompressedBCJson(c));
    } catch (e) {
      throw new ImportError("BC compressed craft JSON", e);
    }
  }
  // Helper for the above function.
  static convertAnyJSONToCrafts(json) {
    if (json.version) {
      // (1) The JSON corresponds to a full BCCM database export; load its crafts
      try {
        return new Database().deserialize(json).rootFolder.findAllCrafts();
      } catch (e) {
        throw new ImportError("BCCM database export", e);
      }
    } else if (json.uuid && json.item) {
      // (2) The JSON corresponds to a BCCM Craft
      return [json];
    } else if (json.Item) {
      // (3) The JSON corresponds to a BC Craft
      try {
        return [this.convertBCJsonToCraft(json)];
      } catch (e) {
        throw new ImportError("BC JSON", e);
      }
    } else {
      throw new ImportError("JSON", "Could not detect a valid format.")
    }
  }
}
class ExportLimitError extends Error {
  constructor() {
    super(`Cannot export more than ${BCEncoder.maxCraftsExportable} crafts at once.`);
    this.name = "ExportLimitError";
  }
}
class ImportError extends Error {
  constructor(nameOfAutodetectedFormat, error) {
    super(`An error occurred when attempting to process the data as ${nameOfAutodetectedFormat}: ${error}`);
    this.name = "ImportError";
  }
}

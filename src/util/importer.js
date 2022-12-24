import LZString from "lz-string";
import Craft from "@/models/craft.js";
import BCDataStringFormat from "@/util/formats/bcDataStringFormat.js";
import { ellipsize } from "@/util/util.js";

// This module is used to import crafts from strings by autodetecting their format.
export default class Importer {
  // Convert a user-provided string in any supported format into a list of Crafts. Formats supported are:
  // 1) BC craft JSON (or array thereof) (bare JSON or compressed base64)
  // 2) CraftingLoadServer command
  static convertStringToCrafts(stringToImport) {
    stringToImport = (stringToImport || "").trim(). // Strip leading and trailing whitespace
      replace(/^["']/, "").replace(/["']$/, ""); // Strip leading and trailing quotes which may be included accidentally
    if (!stringToImport) throw new ImportError(stringToImport, null, "No data to import.");
    // Step 1: convert the string into a JSON by decoding whichever format it is in.
    let parsedJson = null;
    if (stringToImport.match(/^[a-zA-Z0-9+/=]+$/)) {
      try {
        parsedJson = JSON.parse(LZString.decompressFromBase64(stringToImport));
      } catch (e) {
        throw new ImportError(stringToImport, "base64", e);
      }
    } else if (stringToImport.startsWith("CraftingLoadServer(")) {
      try {
        const encodedData = stringToImport.match(/CraftingLoadServer\(["'`](.*?)["'`]\)/)[1];
        parsedJson = BCDataStringFormat.convertBCDataStringToBCCraftJSONs(encodedData);
      } catch(e) {
        throw new ImportError(stringToImport, "CraftingLoadServer command", e);
      }
    } else if (stringToImport[0] == "{" || stringToImport[0] == "[") {
      try {
        parsedJson = JSON.parse(stringToImport);
      } catch (e) {
        throw new ImportError(stringToImport, "JSON", `The provided text is not valid JSON: "${stringToImport.length > 10 ? `${stringToImport.substr(0, 9)}...` : stringToImport}"`);
      }
    } else {
      throw new ImportError(stringToImport, null, "The provided data does not appear to match any supported format.");
    }
    // Step 2: once we have a JSON, find all the crafts inside and convert them
    if (parsedJson.version && parsedJson.rootFolder) {
      throw new ImportError(stringToImport, null, "This is a full database backup, please use the backup restoring feature on the Settings page to restore this data.");
    } else {
      if (!Array.isArray(parsedJson)) {
        parsedJson = [parsedJson];
      }
      try {
        return parsedJson.map(c => Craft.fromBCJson(c));
      } catch (e) {
        throw new ImportError(stringToImport, null, e);
      }
    }
  }
}
class ImportError extends Error {
  constructor(data, nameOfAutodetectedFormat, error) {
    if (nameOfAutodetectedFormat) {
      super(`An error occurred when attempting to process the data "${ellipsize(data, 20)}" as ${nameOfAutodetectedFormat}: ${error}`);
    } else {
      super(`An error occurred when attempting to process the data "${ellipsize(data, 20)}": ${error}`);
    }
    this.name = "ImportError";
  }
}

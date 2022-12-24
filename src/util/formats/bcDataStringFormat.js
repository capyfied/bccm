import LZString from "lz-string";

export default class BCDataStringFormat {
  static maxCraftsExportable = 40; // The limit on how many crafts can be exported at once, due to BC limitations.

  // Convert a list of Crafts into a command the user can run on BC to import them all.
  static convertCraftsToBCImportCommand(crafts) {
    const dataString = this.convertBCCraftJSONsToBCDataString(crafts.map(craft => craft.toBCJson()));
    return `CraftingLoadServer("${dataString.replace(/"/g, '\\"')}")`;
  }
  // Convert a list of BC craft JSONs into a compressed, UTF-encoded string that's used by BC to store all the player's crafts on the backend.
  // See BC's Crafting.js:CraftingSaveServer().
  static convertBCCraftJSONsToBCDataString(crafts) {
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
  // Does the reverse of the above function, i.e. converts a UTF-encoded data string into a list of BC craft JSONs.
  static convertBCDataStringToBCCraftJSONs(dataString) {
    if (!dataString) throw "No data to deserialize.";
    const decompressedString = LZString.decompressFromUTF16(dataString);
    const crafts = [];
    const serializedCrafts = decompressedString.split("§");
    for (let i = 0; i < serializedCrafts.length; i++) {
      const parts = serializedCrafts[i].split("¶");
      const craft = {};
      craft.Item = (parts.length >= 1) ? parts[0] : "";
      craft.Property = (parts.length >= 2) ? parts[1] : "";
      craft.Lock = ((parts.length >= 3) ? parts[2] : "");
      craft.Name = (parts.length >= 4) ? parts[3] : "";
      craft.Description = (parts.length >= 5) ? parts[4] : "";
      craft.Color = (parts.length >= 6) ? parts[5] : "";
      craft.Private = ((parts.length >= 7) && (parts[6] == "T"));
      craft.Type = (parts.length >= 8) ? parts[7] || null : null;
      craft.OverridePriority = (parts.length >= 9 && parts[8] !== "") ? Number.parseInt(parts[8]) : null;
      if (craft.Item && craft.Name && (craft.Item != "") && (craft.Name != "")) {
        crafts.push(craft);
      } else {
        throw `Invalid craft found: ${JSON.stringify(craft)}, deserialized from line "${serializedCrafts[i]}" of "${decompressedString}"`;
      }
    }
    return crafts;
  }
}
class ExportLimitError extends Error {
  constructor() {
    super(`Cannot export more than ${BCDataStringFormat.maxCraftsExportable} crafts at once.`);
    this.name = "ExportLimitError";
  }
}

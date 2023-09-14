import LZString from "lz-string";

export default class BCImportCommandFormat {
  static defaultMaxCraftsExportable = 80; // The limit on how many crafts can be exported at once, due to BC limitations.

  // Convert a list of Crafts into a command the user can run on BC to import them all.
  // By default the limit is 80 crafts, but this can be optionally overriden by passing a different non-zero number.
  static convertCraftsToBCImportCommand(crafts, limitOverride = 0) {
    if (!crafts) throw "No crafts to encode.";
    const maxCraftsExportable = limitOverride || this.defaultMaxCraftsExportable;
    if (crafts.length > maxCraftsExportable) throw new ExportLimitError(maxCraftsExportable);
    const base64Crafts = LZString.compressToBase64(JSON.stringify(crafts.map(craft => craft.toBCJson())));
    return `CraftingLoadServer(JSON.parse(LZString.decompressFromBase64("${base64Crafts}")))`;
  }

  // Does the reverse of the above function, i.e. converts a base64-encoded compressed JSON into a list of BC craft JSONs.
  static convertBCImportCommandToBCCraftJSONs(string) {
    if (!string) throw "No data to deserialize.";
    string = string.match(/decompressFromBase64\(["'`](.*?)["'`]\)/)[1];
    if (!string) throw "Failed to extract data from CraftingLoadServer command via regex.";
    return JSON.parse(LZString.decompressFromBase64(string));
  }
}
class ExportLimitError extends Error {
  constructor(limit) {
    super(`Cannot export more than ${limit} crafts at once.`);
    this.name = "ExportLimitError";
  }
}

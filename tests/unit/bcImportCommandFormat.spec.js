import BCImportCommandFormat from "@/util/formats/bcImportCommandFormat.js";
import Craft from "@/models/craft.js";
import requireGlobals from "./requireGlobals.js";

describe('BCImportCommandFormat', () => {
  beforeAll(requireGlobals);

  it('encodes and decodes a craft correctly', () => {
    const originalBCJson = {
      Item: "Chains",
      Property: "Secure",
      Lock: "",
      Name: "A secure chain",
      Description: "",
      Color: "#7797C5",
      Private: true,
      Type: null,
      ItemProperty: { OverridePriority: 5 }
    };
    const command = BCImportCommandFormat.convertCraftsToBCImportCommand([Craft.fromBCJson(originalBCJson)]);
    const decodedCrafts = BCImportCommandFormat.convertBCImportCommandToBCCraftJSONs(command);
    expect(decodedCrafts).toEqual([originalBCJson]);
  });
});

import BCDataStringFormat from "@/util/formats/bcDataStringFormat.js";
import Craft from "@/models/craft.js";
import requireGlobals from "./requireGlobals.js";

describe('BCDataStringFormat', () => {
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
      OverridePriority: null
    };
    const command = BCDataStringFormat.convertCraftsToBCImportCommand([Craft.fromBCJson(originalBCJson)]);
    const decodedCrafts = BCDataStringFormat.convertBCDataStringToBCCraftJSONs(command);
    expect(decodedCrafts).toEqual([originalBCJson]);
  });
});

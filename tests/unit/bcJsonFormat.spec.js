import BCJsonFormat from "@/util/formats/bcJsonFormat.js";
import Craft from "@/models/craft.js";
import requireGlobals from "./requireGlobals.js";

const getTestCraft = () => Craft.fromJson({
  uuid: "f1a6f969-478b-4823-a148-7d252f7fedb6",
  item:"LeatherCollar",
  property: "Comfy",
  lock: "MetalPadlock",
  name: "Test collar",
  description: "Test description",
  color: "#6F2626,#C06B6B",
  private: true,
  type: null,
  priority: 5
});

describe('BCJsonFormat', () => {
  beforeAll(requireGlobals);

  it('encodes and decodes a BC craft correctly', () => {
    const craft = getTestCraft();
    const expectedBCJson = {
      Item: "LeatherCollar",
      Property: "Comfy",
      Lock: "MetalPadlock",
      Name: "Test collar",
      Description: "Test description",
      Color: "#6F2626,#C06B6B",
      Private: true,
      Type: null,
      ItemProperty: { OverridePriority: 5 }
    };
    expect(BCJsonFormat.convertCraftToBCJson(craft)).toEqual(expectedBCJson);
    const decodedCraft = BCJsonFormat.convertBCJsonToCraft(expectedBCJson);
    decodedCraft.uuid = craft.uuid;
    expect(decodedCraft.toJson()).toEqual(craft.toJson());
  });

  it('encodes and decodes a compressed BC craft correctly', () => {
    const craft = getTestCraft();
    const expectedCompressedBCJson = "N4IgkgLgpgtiBcIAyUCGEAWUBOBhA9gDaGrYgA0IACtvgA44QCeCIBMAZi5UvgMYBrVgFkoEVISqoAJoX5DKAOVQworACpQAzhAAEfIiTKUAItr7YAlnQiX8AOw3a9081Zt3HlAnLKIAxABsAGIATIHh5P64AAyBAEIJFNRWAG7oavAQ2ACuUJTqTAwI9jnElJCwNPSMLPCgAPKpOFauNHZWzAgArAC+vUA=";
    expect(BCJsonFormat.convertCraftToCompressedBCJson(craft)).toEqual(expectedCompressedBCJson);
    const decodedCraft = BCJsonFormat.convertCompressedBCJsonToCraft(expectedCompressedBCJson);
    decodedCraft.uuid = craft.uuid;
    expect(decodedCraft.toJson()).toEqual(craft.toJson());
  });
});

import Importer from "@/util/importer.js";
import requireGlobals from "./requireGlobals.js";

describe('BCJsonFormat', () => {
  beforeAll(requireGlobals);

  it('identifies formats correctly', () => {
    [
      // BC JSON
      '{"Item":"Net","Property":"Secure","Lock":"","Name":"A secure net","Description":"","Color":"#A7A7A7,#A7A7A7","Private":true,"Type":null,"OverridePriority":null}',
      // Base64 compressed BC JSON
      'N4IgkgLgpgtiBcIByUIgDQgAoCcD2ADlDhAJ4IgDKUAxgK45QYgAyeNA1hc0gIYxNEAQQAEAZ1oMoIgHapmAEShiaOAJYEIavDO6YAwngA2eHBQDEQgOzXr6SzcfNcagG69oCCDjpRMAFVIiBBk6IyNMAHlXYnUAEygXUzUyELCjAF8gA===',
      // Array of BC JSONs
      '[{"Item":"Net","Property":"Secure","Lock":"","Name":"A secure net","Description":"","Color":"#A7A7A7,#A7A7A7","Private":true,"Type":null,"OverridePriority":null}]',
      // Base64 compressed array of BC JSONs
      'NobwRAkgLgpgtmAXGAcjKYA0YAKAnAewAcY8oBPJMAZRgGMBXPGLMAGQLoGsrWUBDOC2QBBAAQBnekxhiAdulYARGBLp4AlkSgaCc3tgDCBADYE8VAMQiA7LduZrd563waAbv1hIoeBjGwAFXISJDkGExNsAHl3Uk0AExg3cw0KMIiTAF8AXSA==',
      // CraftingLoadServer command
      `CraftingLoadServer(JSON.parse(LZString.decompressFromBase64("NobwRAkgLgpgtmAXGAcjKYA0YAKAnAewAcY8oBPJMAZRgGMBXPGLMAGQLoGsrWUBDOC2QBBAAQBnekxhiAdulYARGBLp4AlkSgaCc3tgDCBADYE8VAMQiA7LduZrd563waAbv1hIoeBjGwAFXISJDkGExNsAHl3Uk0AExg3cw0KMIiTAF8AXSA==")))`
    ].forEach(str => {
      expect(Importer.convertStringToCrafts(str)[0].name).toEqual("A secure net");
    });
  });

  it('deals with other variants correctly', () => {
    [
      // BC JSON, but with spaces and tabs surrounding it
      '	 { "Item":"Net","Property":"Secure","Lock":"","Name":"A secure net","Description":"","Color":"#A7A7A7,#A7A7A7","Private":true,"Type":null,"OverridePriority":null }   ',
      // Array of BC JSONs, but inside a double-quote string
      '"[{\\"Item\\":\\"Net\\",\\"Property\\":\\"Secure\\",\\"Lock\\":\\"\\",\\"Name\\":\\"A secure net\\",\\"Description\\":\\"\\",\\"Color\\":\\"#A7A7A7,#A7A7A7\\",\\"Private\\":true,\\"Type\\":null,\\"OverridePriority\\":null}]"',
      // BC JSON, but inside a single-quote string
      `'{"Item":"Net","Property":"Secure","Lock":"","Name":"A secure net","Description":"","Color":"#A7A7A7,#A7A7A7","Private":true,"Type":null,"OverridePriority":null}'`,
      // BC JSON, but inside a backtick string
      '`{"Item":"Net","Property":"Secure","Lock":"","Name":"A secure net","Description":"","Color":"#A7A7A7,#A7A7A7","Private":true,"Type":null,"OverridePriority":null}`'
    ].forEach(str => {
      expect(Importer.convertStringToCrafts(str)[0].name).toEqual("A secure net");
    });
  });

});

import Database from "@/models/database.js";
import requireGlobals from "./requireGlobals.js";

describe('Database', () => {
  beforeAll(requireGlobals);

  it('serializes and deserializes correctly', () => {
    const originalDb = new Database();
    originalDb.importCrafts("N4IgkgLgpgtiBcIAyUCGEAWUBOBhA9gDaGrYgA0IACtvgA44QCeCIBMAZi5UvgMYBrVgFkoEVISqoAJoX5DKAOVQworACpQAzhAAEfIiTKUAItr7YAlnQiX8AOw3a9081Zt3HlAnLKIAxABsAGIATIHh5P64AAyBAEIJFNRWAG7oavAQ2ACuUJTqTAwI9jnElADyqThWrjR2VswlZYQAvkA=");
    const originalSerialization = originalDb.serialize();
    const restoredDb = new Database();
    restoredDb.deserialize(originalSerialization);
    expect(restoredDb.rootFolder.findAllCrafts()[0].name).toEqual("Test collar");
    const restoredSerialization = restoredDb.serialize();
    expect(originalSerialization).toEqual(restoredSerialization);
  });
});

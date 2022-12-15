import { renameObjectsToMakeThemUnique } from "@/util/util.js";

describe('Util', () => {
  it('renameObjectsToMakeThemUnique', () => {
    const crafts = [
      { name: "foo" }, { name: "bar" }, { name: "baz" }, { name: "foo" }, { name: "foo" }
    ]
    renameObjectsToMakeThemUnique(crafts)
    expect(crafts.map(c => c.name).join(", ")).toBe(["foo", "bar", "baz", "foo (2)", "foo (3)"].join(", "));
  });
});

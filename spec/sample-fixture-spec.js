const path = require("path");

// The fixture beside this file is a plain sample — the file to open when you
// want to look at the highlighting rather than assert on it.
//
// This grammar has no files of its own: it is injected into comments and into
// plain text, so the sample is a .txt file and language-text has to be loaded
// for anything to inject into.

describe("TODO sample fixture", () => {
  let editor = null;

  beforeEach(async () => {
    await atom.packages.activatePackage("language-text");
    await atom.packages.activatePackage("language-todo");
    editor = await atom.workspace.open(path.join(__dirname, "fixtures", "sample.txt"));
  });

  function rowOf(text) {
    return editor.getBuffer().getLines().indexOf(text);
  }

  function scopesAtStartOf(text) {
    const row = rowOf(text);
    expect(row).toBeGreaterThan(-1);
    return editor.scopeDescriptorForBufferPosition([row, 0]).getScopesArray();
  }

  it("opens as plain text", () => {
    expect(editor.getGrammar().scopeName).toBe("text.plain");
  });

  it("injects a scope for every marker it recognises", () => {
    for (const marker of [
      "TODO",
      "FIXME",
      "CHANGED",
      "XXX",
      "IDEA",
      "HACK",
      "NOTE",
      "REVIEW",
      "NB",
      "BUG",
      "QUESTION",
      "COMBAK",
      "TEMP",
      "DEBUG",
      "OPTIMIZE",
      "WARNING",
    ]) {
      expect(scopesAtStartOf(marker)).toContain(`storage.type.class.${marker.toLowerCase()}`);
    }
  });

  it("does not match inside a longer word", () => {
    for (const notAMarker of ["xTODO", "TODOs", "NOTEBOOK", "subTODO"]) {
      const scopes = scopesAtStartOf(notAMarker);
      expect(scopes.filter((scope) => scope.startsWith("storage.type.class."))).toEqual([]);
    }
  });
});

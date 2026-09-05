const path = require("path");

// TODO is an injection-only grammar, so it owns no file type. Assigning it
// directly keeps this completeness check independent of any host grammar's
// node types.

describe("TODO sample fixture", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-todo");
    editor = await lumine.workspace.open(path.join(__dirname, "fixtures", "sample.txt"));
    editor.setGrammar(lumine.grammars.grammarForScopeName("text.todo"));
    await editor.getBuffer().getLanguageMode().ready;
    await editor.getBuffer().getLanguageMode().atTransactionEnd();
  });

  function scopesAtStartOf(text) {
    const row = editor.getBuffer().getLines().indexOf(text);
    expect(row).toBeGreaterThan(-1);
    return editor.scopeDescriptorForBufferPosition([row, 0]).getScopesArray();
  }

  it("parses under the TODO injection grammar", () => {
    expect(editor.getGrammar().scopeName).toBe("text.todo");
  });

  it("scopes every marker it recognizes", () => {
    const markers = [
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
    ];

    for (const marker of markers) {
      expect(scopesAtStartOf(marker)).toContain("storage.type.class.todo");
    }
  });

  it("does not match inside a longer word", () => {
    for (const notAMarker of ["xTODO", "TODOs", "NOTEBOOK", "subTODO"]) {
      expect(scopesAtStartOf(notAMarker)).not.toContain("storage.type.class.todo");
    }
  });
});

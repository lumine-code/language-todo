describe("TODO grammar", () => {
  let grammar = null;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-todo");

    grammar = lumine.grammars.grammarForScopeName("text.todo");
  });

  it("parses the grammar", () => {
    expect(grammar).toBeTruthy();
    expect(grammar.scopeName).toBe("text.todo");
  });

  it("recognizes TODO markers only at word boundaries", async () => {
    const editor = await lumine.workspace.open("sample.todo");
    editor.setText("TODO: fix this");
    editor.setGrammar(grammar);

    const languageMode = editor.getBuffer().languageMode;
    await languageMode.ready;
    expect(languageMode.tree.rootNode.toString()).toBe("(program (todo (todo_token) (todo_body)))");

    editor.setText("xTODO");
    await languageMode.atTransactionEnd();
    expect(languageMode.tree.rootNode.toString()).toBe("(program)");
  });
});

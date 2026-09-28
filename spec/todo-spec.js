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
    let root = editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => node.parent == null);
    expect(root.type).toBe("program");
    expect(root.namedChildren.map((node) => node.type)).toEqual(["todo"]);
    expect(root.namedChild(0).namedChildren.map((node) => node.type)).toEqual([
      "todo_token",
      "todo_body",
    ]);
    expect((await editor.getSyntaxDiagnostics()).hasError).toBe(false);

    editor.setText("xTODO");
    await languageMode.atTransactionEnd();
    root = editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => node.parent == null);
    expect(root.type).toBe("program");
    expect(root.namedChildren).toEqual([]);
  });
});

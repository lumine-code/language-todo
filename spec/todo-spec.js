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
    expect(root.hasError).toBe(false);

    editor.setText("xTODO");
    await languageMode.atTransactionEnd();
    root = editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => node.parent == null);
    expect(root.type).toBe("program");
    expect(root.namedChildren).toEqual([]);
  });

  it("rejects marker suffixes and updates the capture when a word boundary changes", async () => {
    const editor = await lumine.workspace.open();
    editor.setGrammar(grammar);
    editor.setText(
      "TODO valid\nFoTODO invalid\nTODO1TODO invalid\nTODO_TODO invalid\nFIXME2BUG invalid",
    );
    const languageMode = editor.getBuffer().languageMode;
    await languageMode.ready;
    let root = editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => node.parent == null);
    expect(root.hasError).toBe(false);
    expect(root.namedChildren.map((node) => node.text)).toEqual(["TODO valid"]);
    expect(editor.scopeDescriptorForBufferPosition([1, 2]).getScopesArray()).not.toContain(
      "storage.type.class.todo",
    );

    editor.getBuffer().setTextInRange(
      [
        [1, 0],
        [1, 2],
      ],
      "  ",
    );
    await languageMode.atTransactionEnd();
    root = editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => node.parent == null);
    expect(root.namedChildren.map((node) => node.text)).toEqual(["TODO valid", "TODO invalid"]);
    expect(editor.scopeDescriptorForBufferPosition([1, 2]).getScopesArray()).toContain(
      "storage.type.class.todo",
    );
  });

  it("keeps NUL characters inside a TODO body without parse errors", async () => {
    const editor = await lumine.workspace.open();
    editor.setGrammar(grammar);
    editor.setText("TODO a\0b\r\nFIXME\r\n");
    await editor.getBuffer().languageMode.ready;
    const root = editor.getSyntaxNodeAtBufferPosition([0, 0], (node) => node.parent == null);
    expect(root.hasError).toBe(false);
    expect(root.namedChildren.map((node) => node.text)).toEqual(["TODO a\0b", "FIXME"]);
  });
});

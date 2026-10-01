# language-todo

TODO and FIXME keyword highlighting.

## Features

- **Grammars**: provides a Tree-sitter grammar built from [tree-sitter-todo](https://github.com/lumine-code/tree-sitter-todo).
- **Syntax highlighting**: highlights `TODO`, `FIXME`, `CHANGED`, `XXX`, `IDEA`, `HACK`, `NOTE`, `REVIEW`, `NB`, `BUG`, `QUESTION`, `COMBAK`, `TEMP`, `DEBUG`, `OPTIMIZE`, and `WARNING` markers in comments and text.
- **Snippets**: shortcuts for common TODO-style markers.
- **Static injections**: accepts the `todo` alias in injection queries and filters out owners without annotation markers.

## Installation

To install `language-todo` search for it in the Install pane of the Lumine settings, or run the command `lumine --install lumine-code/language-todo`.

## Services

- [`todo.injection`](docs/todo.injection.md): provided for JavaScript injection rules that need runtime logic; static rules use the grammar's `todo` alias directly.

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!

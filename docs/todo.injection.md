# todo.injection

Lets a language grammar highlight `TODO`-style markers inside its own comments, by injecting the todo grammar at nodes it nominates.

|             |                                                         |
| ----------- | ------------------------------------------------------- |
| Version     | `1.0.0`                                                 |
| Provided by | `provideTodoInjection()` returning the injection helper |
| Consumed by | `consumeTodoInjection(todo)`                            |
| Owner       | `language-todo` (bundled)                               |

Prefer a static injection query when the syntax tree identifies the comment nodes. This service remains available when eligibility or content needs runtime logic. Its shape is identical to `hyperlink.injection`.

The markers recognised are `TODO`, `FIXME`, `CHANGED`, `XXX`, `IDEA`, `HACK`, `NOTE`, `REVIEW`, `NB`, `BUG`, `QUESTION`, `COMBAK`, `TEMP`, `DEBUG`, `OPTIMIZE`, and `WARNING`.

## Registration

For static rules, declare `treeSitter.injectionsQuery` in the parent grammar descriptor and put this pattern in the referenced SCM file:

```scheme
((comment) @injection.owner @injection.content
  (#set! injection.language "todo")
  (#set! injection.include-children)
  (#set! injection.language-scope "none"))
```

Replace `comment` with the actual comment node types in the parent parser. The target grammar declares `injectionContentRegex`, which filters owners without annotation markers before a child layer is created. The marker list belongs to this package, so a consumer never repeats it. No consumed service or JavaScript entry point is needed. The editor adds injections when the target grammar becomes available and removes them when it is disabled.

For the JavaScript service, declare this in your `package.json`:

```json
{
  "consumedServices": {
    "todo.injection": {
      "versions": { "^1.0.0": "consumeTodoInjection" }
    }
  }
}
```

The service registers Tree-sitter injection points on the exact parent grammar scopes supplied by the consumer.

## Contract

```ts
type TodoInjection = {
  addInjectionPoint(
    scopeName: string,
    options: {
      types: string | string[];
      language?(node: Node): string | null | undefined;
      content?(node: Node): Node | Node[];
    },
  ): Disposable;

  test(node: Node): boolean;
};
```

| Member                                  | Description                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `addInjectionPoint(scopeName, options)` | Registers an injection point on a grammar and returns its cleanup. `scopeName` is the parent language's scope.     |
| `options.types`                         | Required. One node type or an array of them — the nodes that may contain a marker.                                 |
| `options.language(node)`                | Optional. Return a language name to force one, `null` to suppress, or `undefined` to fall through.                 |
| `options.content(node)`                 | Optional. Narrows the injection to some of the node's children. Defaults to the node itself.                       |
| `test(node)`                            | The default check — whether the node's text contains one of the markers. Exposed for a custom `language` callback. |

## Minimal example

```js
const SCOPES = ["source.mylang", "source.mylang.embedded"];

exports.consumeTodoInjection = (todo) => {
  const registrations = SCOPES.map((scope) =>
    todo.addInjectionPoint(scope, { types: ["comment"] }),
  );
  return {
    dispose() {
      for (const registration of registrations.splice(0)) registration.dispose();
    },
  };
};
```

## Behavior

Register `comment` node types only. Unlike hyperlinks, markers are meaningful in comments and noise everywhere else — injecting into strings will highlight the word `NOTE` in ordinary prose.

The injection fires only for nodes whose text contains one of the markers. Static rules and the service's default test use the same `injectionContentRegex` from the target grammar descriptor. The target prefilter is applied only to static rules, so a JavaScript callback can still deliberately override the default test.

The service creates one injection per eligible comment node. Static rules preserve that boundary by default; use `injection.combined` only when joining owners preserves the target parser's meaning and error recovery.

Register each scope your package ships separately. The table is keyed by exact scope name, so a dialect needs its own call.

## Teardown

`addInjectionPoint` returns a `Disposable` that removes every injection point created for `options.types`. A consumer must return that disposable from its service callback; when it registers several scopes, it returns one aggregate disposable that owns them all. This lets provider disable, consumer disable and package reactivation remove the old generation before reconnecting the edge.

## Versioning

`1.0.0` provided, `^1.0.0` consumed. A change that breaks this shape gets a new service name rather than a new major version, and both sides move in the same release.

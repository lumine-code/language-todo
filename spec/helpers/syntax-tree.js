exports.inspect = (context) => {
  const root = context.getRootSyntaxNode();
  return {
    type: root.type,
    hasError: root.hasError,
    namedChildren: root.namedChildren.map((node) => ({
      type: node.type,
      text: node.text,
      namedChildren: node.namedChildren.map((child) => ({ type: child.type })),
    })),
  };
};

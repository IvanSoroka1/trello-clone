module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.CallExpression, {
      callee: { name: "fetchWithRefresh" }
    })
    .forEach(path => {
      const args = path.value.arguments;

      const hasNavigate = args.some(
        arg => arg.type === "Identifier" && arg.name === "navigate"
      );

      if (!hasNavigate) {
        args.push(j.identifier("navigate"));
      }
    });

  return root.toSource();
};

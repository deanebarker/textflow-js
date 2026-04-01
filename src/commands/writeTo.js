async function writeTo(working, command, p) {
  let varArg = command.getArg("var");
  working.vars.set(varArg, working.text);
  return working.text;
}
writeTo.title = "Write To Variable";
writeTo.description = "Write the current text to a variable.";
writeTo.args = [
  { name: "var", type: "string", description: "The variable name to write to." },
];
writeTo.parseValidators = [
  {
    test: (command) => {
      return command.hasArg("var") && typeof command.getArg("var") === "string";
    },
    message:
      "You must provide a 'var' argument with a variable name.",
  },
];

export default writeTo;

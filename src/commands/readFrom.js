function readFrom(working, command, p) {
  let varArg = command.getArg("var");
  return working.vars.get(varArg);
}
readFrom.title = "Read From Variable";
readFrom.description = "Read the value of a variable.";
readFrom.args = [
  { name: "var", type: "string", description: "The variable name to read from." },
];
readFrom.parseValidators = [
  {
    test: (command) => {
      return command.hasArg("var") && typeof command.getArg("var") === "string";
    },
    message:
      "You must provide a 'var' argument with a variable name.",
  },
];

export default readFrom;

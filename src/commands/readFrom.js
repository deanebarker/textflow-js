function readFrom(working, command, p) {
  let varArg = command.getArg("var");
  const value = working.vars.get(varArg);

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }

  return String(value);
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

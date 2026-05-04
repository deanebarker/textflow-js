import jsonata from "jsonata";

async function gotoCommand(working, command, p) {
  const label = command.getArg("label");
  const expr = command.getArg("if");

  if (expr) {
    const data = { text: working.text, vars: Object.fromEntries(working.vars) };
    const result = await jsonata(expr).evaluate(data);

    if (Boolean(result)) {
      working.goto = label;
    }
  } else {
    working.goto = label;
  }
  return working.text;
}
gotoCommand.title = "Go To";
gotoCommand.description =
  "Skip ahead in the pipeline to the named label, bypassing any commands in between.";
gotoCommand.args = [
  {
    name: "label",
    type: "string",
    description: "The name of the label to jump to.",
  },
  {
    name: "if",
    type: "string",
    description:
      "An optional JSONata expression to evaluate before deciding whether to jump. The expression will be evaluated with the current input as the context, and the result will be coerced to a boolean.",
  },
];
gotoCommand.parseValidators = [
  {
    test: (command) => command.hasArg("label"),
    message: "You must provide a label to jump to.",
  },
];
gotoCommand.passthrough = true;

export default gotoCommand;

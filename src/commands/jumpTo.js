function jumpTo(working, command, p) {
  const label = command.getArg("label");
  working.jumpto = label;
  return working.text;
}
jumpTo.title = "Jump To";
jumpTo.description =
  "Skip ahead in the pipeline to the named label, bypassing any commands in between.";
jumpTo.args = [
  {
    name: "label",
    type: "string",
    description: "The name of the label to jump to.",
  },
];
jumpTo.parseValidators = [
  {
    test: (command) => command.hasArg("label"),
    message: "You must provide a label to jump to.",
  },
];
jumpTo.passthrough = true;

export default jumpTo;

function append(working, command, p) {
  const text = command.getArg("text");

  if(!text) {
    return working.text;
  }

  return working.text + text;
}

// Meta
append.title = "Append Text";
append.description = "Add specified text to the end of the working text.";
append.args = [
  {
    name: "text",
    type: "string",
    description: "Text to append to the working text.",
  },
];
append.parseValidators = [
  {
    test: (command) => {
      return command.hasArg("text");
    },
    message: "You must provide text to append.",
  },
];

export default append;

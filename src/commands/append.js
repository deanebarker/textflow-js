function append(working, command, p) {
  const textToAppend = command.getArg("text");
  return working.text + textToAppend;
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
append.allowedContentTypes = ["plain", "html", "json", "*"];
append.parseValidators = [
  {
    test: (command) => {
      return command.getArg("text");
    },
    message: "You must provide text to append.",
  },
];

export default append;

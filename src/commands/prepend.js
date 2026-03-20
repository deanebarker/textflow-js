function prepend(working, command, p) {
  const textToPrepend = command.getArg("text");

  if (!textToPrepend) {
    return working.text;
  }

  return textToPrepend + working.text;
}

// Meta
prepend.title = "Prepend Text";
prepend.description =
  "Add specified text to the beginning of the working text.";
prepend.args = [
  {
    name: "text",
    type: "string",
    description: "Text to prepend to the working text.",
  },
];
prepend.allowedContentTypes = ["plain", "html", "json", "*"];
prepend.parseValidators = [
  {
    test: (command) => {
      return command.hasArg("text");
    },
    message: "You must provide text to prepend.",
  },
];

export default prepend;

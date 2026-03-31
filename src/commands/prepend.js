function prepend(working, command, p) {
  const text = command.getArg("text");

  if (!text) {
    return working.text;
  }

  return text + working.text;
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

function prepend(working, command, p) {
  return command.getArg("text") + working.text;
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
      return command.getArg("text");
    },
    message: "You must provide text to prepend.",
  },
];

export default prepend;

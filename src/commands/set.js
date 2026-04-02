function set(working, command, p) {
  const text = command.getArg("text") ?? "";
  return text;
}

// Meta
set.title = "Set Text";
set.description = "Set the working text to the specified value.";
set.args = [
  {
    name: "text",
    type: "string",
    description: "Text to set as the working text.",
    required: false,
  },
];
set.parseValidators = [];

export default set;

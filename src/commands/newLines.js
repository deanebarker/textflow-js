function newLines(working, command) {
  // Get all arguments upfront
  const trim = command.getArg("trim");
  const removeEmpty = command.getArg("remove-empty");

  const lineBreakTag = "<br>"; // HTML5 line break tag (no closing tag needed)

  const shouldTrim = trim === "true" || trim === true;
  const shouldRemoveEmpty = removeEmpty === "true" || removeEmpty === true;

  const lines = working.text
    .split("\n")
    .map((line) => shouldTrim ? line.trim() : line)
    .filter((line) => shouldRemoveEmpty ? line : true);
  
    return lines.join(lineBreakTag);
}


// Meta
newLines.title = "New Lines";
newLines.description = "Convert line breaks to HTML line-break tags.";
newLines.args = [
  {
    name: "trim",
    type: "boolean",
    description: "Whether to trim whitespace from each line.",
    default: false,
    allowedValues: ["true", "false", true, false],
  },
  {
    name: "remove-empty",
    type: "boolean",
    description: "Whether to remove empty lines after trimming.",
    default: false,
    allowedValues: ["true", "false", true, false],
  }
];
newLines.parseValidators = [];


export default newLines;

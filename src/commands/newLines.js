function newLines(working, command) {

  const lineBreakTag = "<br>"; // HTML5 line break tag (no closing tag needed)

  const trim = command.getArg("trim") === "true" || command.getArg("trim") === true;
  const removeEmpty = command.getArg("remove-empty") === "true" || command.getArg("remove-empty") === true;

  const lines = working.text
    .split("\n")
    .map((line) =>  trim ? line.trim() : line)
    .filter((line) => removeEmpty ? line : true);
  
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

newLines.allowedContentTypes = ["plain", "*"];

export default newLines;

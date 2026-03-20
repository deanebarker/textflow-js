function newLines(working, command, p) {

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
    default: false
  },
  {
    name: "remove-empty",
    type: "boolean",
    description: "Whether to remove empty lines after trimming.",
    default: false
  }
];
newLines.parseValidators = [
  {
    test: (command) => {
      if(!command.hasArg("trim")) return true; // If trim is not provided, it's valid
      const trimArg = command.getArg("trim");
      return trimArg === undefined || trimArg === "true" || trimArg === "false" || trimArg === true || trimArg === false;
    },
    message: "The 'trim' argument must be a boolean or a string 'true'/'false'."
  },
  {
    test: (command) => {
      if(!command.hasArg("remove-empty")) return true; // If remove-empty is not provided, it's valid
      const removeEmptyArg = command.getArg("remove-empty");
      return removeEmptyArg === undefined || removeEmptyArg === "true" || removeEmptyArg === "false" || removeEmptyArg === true || removeEmptyArg === false;
    },
    message: "The 'remove-empty' argument must be a boolean or a string 'true'/'false'."
  }
];

newLines.allowedContentTypes = ["plain", "*"];

export default newLines;

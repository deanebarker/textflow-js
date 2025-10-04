function wrapLines(working, command, p) {
  const tag = command.getArg("tag") || "div";
  const className = command.getArg("class");

  const lines = working.text.split("\n");
  return lines
    .map((l) => `<${tag} class="${className}">${l}</${tag}>`)
    .join("\n");
}

// Meta
wrapLines.title = "Wrap Lines";
wrapLines.description =
  "Wrap each line of text in a specified HTML tag with an optional class.";
wrapLines.args = [
  {
    name: "tag",
    type: "string",
    description: "The HTML tag to wrap each line in.",
  },
  {
    name: "class",
    type: "string",
    description: "An optional class to apply to the wrapping tag.",
  },
];
wrapLines.allowedContentTypes = ["text", "html"];

export default wrapLines;

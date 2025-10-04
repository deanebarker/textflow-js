function forceType(working, command, p) {

    const type = command.getArg("type").toLowerCase();
    working.contentType = type;
  
  return working;
}
forceType.title = "Set Type";
forceType.description = "Force the content type of the working data.";
forceType.args = [
  {
    name: "type",
    type: "string",
    description: "Content type to set (e.g., 'json', 'html', 'plain')",
  },
];
forceType.allowedContentTypes = ["*"];
forceType.passthrough = true;
forceType.parseValidators = [
  {
    test: (command) => {
      return command.getArg("type");
    },
    message: "You must provide a valid content type (json, html, plain).",
  },
];

export default forceType;

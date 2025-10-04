function setContainerSize(working, command, p) {
  if (command.getArg("width")) {
    working.container.width = command.getArg("width");
  }

  if (command.getArg("height")) {
    working.container.height = command.getArg("height");
  }

  if (command.getArg("minHeight")) {
    working.container.minHeight = command.getArg("minHeight");
  }

  return working;
}
setContainerSize.title = "Set Container Size";
setContainerSize.description =
  "Set the width, height, and/or minHeight of the container that will hold the embedded content. This is normally only needed when the content of an IFRAME doesn't report it correctly.";
setContainerSize.args = [
  { name: "width", type: "number", description: "The width of the container." },
  {
    name: "height",
    type: "number",
    description: "The height of the container.",
  },
  {
    name: "minHeight",
    type: "number",
    description: "The minimum height of the container.",
  },
];
setContainerSize.parseValidators = [
  {
    test: (command) => {
      return command.getArg("width") || command.getArg("height") || command.getArg("minHeight");
    },
    message: "You must provide at least one dimension (width, height, minHeight) for the container.",
  },
];

export default setContainerSize;

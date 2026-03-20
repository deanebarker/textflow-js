function setContainerStyles(working, command, p) {

  working.container.style = {};

  for (const arg of command.arguments) {
    working.container.style[arg.key] = arg.value;
  }

  return working;
}
setContainerStyles.title = "Set Container Style";
setContainerStyles.description = "Set the inline styles the container that will hold the embedded content. This is normally only needed when the content of an IFRAME doesn't report it correctly.";

export default setContainerStyles;
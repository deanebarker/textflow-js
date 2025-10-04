function noOp(working, command, p) {
  return working;
}
noOp.title = "No Operation";
noOp.description =
  "A command that does nothing and returns the working data unchanged.";
noOp.args = [];
noOp.allowedContentTypes = ["*"];
noOp.passthrough = true;

export default noOp;

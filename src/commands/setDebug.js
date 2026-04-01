function setDebug(working, args, p) {
  p.debug = true;
  return working.text;
}
setDebug.title = "Set Debug";
setDebug.description =
  "Enable debug logging for the pipeline. Does not affect the working text.";
setDebug.args = [];
setDebug.passthrough = true;

export default setDebug;

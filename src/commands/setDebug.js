function setDebug(working, args, p) {
  p.debug = true;
  return working;
}
setDebug.title = "Set Debug";
setDebug.description =
  "Enable debug logging for the pipeline. Does not affect the working text.";
setDebug.args = [];
setDebug.allowedContentTypes = ["*"];
setDebug.passthrough = true;

export default setDebug;

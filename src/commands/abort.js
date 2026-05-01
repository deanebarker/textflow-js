function abort(working, command, p) {
  working.abort = true;
  return working.text;
}
abort.title = "Abort";
abort.description =
  "Abort the pipeline immediately, discarding any partial results.";
abort.args = [];
abort.passthrough = true;

export default abort;

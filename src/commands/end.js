function end(working, command, p) {
  working.end = true;
  return working.text;
}
end.title = "End";
end.description =
  "End the pipeline immediately, returning the working text as-is.";
end.args = [];
end.passthrough = true;

export default end;

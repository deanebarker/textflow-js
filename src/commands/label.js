function label(working, command, p) {
  return working.text;
}
label.title = "Label";
label.description =
  "A named marker in the pipeline that can be used as a jump target.";
label.args = [
  {
    name: "name",
    type: "string",
    description: "The name of the label",
  },
];
label.passthrough = true;

export default label;

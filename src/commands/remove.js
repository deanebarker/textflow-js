function remove(working, command, p) {
  let selector = command.getArg("selector");
  if (selector) {
    // Create a temporary DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(working.text, "text/html");
    const elements = doc.querySelectorAll(selector);
    elements.forEach((el) => el.remove());
    return doc.documentElement.outerHTML;
  }
  return working.text;
}
remove.title = "Remove Element";
remove.description = "Remove specified element from the working text.";
remove.args = [
  {
    name: "selector",
    type: "string",
    description: "CSS selector for the element(s) to remove.",
  },
];
remove.allowedContentTypes = ["plain", "html", "json", "*"];
remove.parseValidators = [
  {
    test: (command) => {
      return command.getArg("selector");
    },
    message: "You must provide a CSS selector to remove elements.",
  },
];

export default remove;

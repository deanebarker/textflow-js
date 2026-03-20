import { Helpers } from "../textflow.js";

async function remove(working, command) {
  const selector = command.getArg("selector");
  if (!selector) {
    return working.text;
  }
  
  const doc = await Helpers.parseHtml(working.text);
  const elements = doc.querySelectorAll(selector);
  elements.forEach((el) => el.remove());
  return doc.body.innerHTML;
}

// Meta
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
      return command.hasArg("selector");
    },
    message: "You must provide a CSS selector to remove elements.",
  },
];

export default remove;

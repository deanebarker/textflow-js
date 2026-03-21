import { Helpers } from "../textflow.js";

async function remove(working, command) {
  const selector = command.getArg("selector");
  if (!selector) {
    return working.text;
  }

  const preserve = command.getArg("preserve");
  const doc = await Helpers.parseHtml(working.text);
  const elements = doc.querySelectorAll(selector);
  elements.forEach((el) => {
    if (preserve === "all") {
      el.replaceWith(...el.childNodes);
    } else if (preserve === "text") {
      el.replaceWith(el.textContent);
    } else {
      el.remove();
    }
  });
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
  {
    name: "preserve",
    type: "string",
    optional: true,
    description: "What to preserve from removed elements: 'all' keeps inner HTML (including nested tags), 'text' keeps only text content.",
    allowedValues: ["all", "text"],
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

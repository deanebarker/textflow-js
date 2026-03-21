import { Helpers } from "../textflow.js";

async function setAttribute(working, command) {
  
  const selector = command.getArg("selector");
  const attr = command.getArg("attribute");
  const value = command.getArg("value");
  const limit = Number(command.getArg("limit")) || 0;

  const doc = await Helpers.parseHtml(working.text);
  const elements = Array.from(doc.querySelectorAll(selector));
  if (!elements.length) {
    console.warn(`No element found for selector: ${selector}`);
    return working;
  }

  const targets = limit === 0 ? elements : elements.slice(0, limit);
  targets.forEach((el) => el.setAttribute(attr, value));
  return doc.body.innerHTML;

}

// Meta
setAttribute.title = "Set Attribute";
setAttribute.description =
  "Set an attribute on a specified element.";
setAttribute.args = [
  {
    name: "selector",
    type: "string",
    description: "CSS selector for the element to modify.",
  },
  {
    name: "attribute",
    type: "string",
    description: "Name of the attribute to set.",
  },
  {
    name: "value",
    type: "string",
    description: "Value to set for the attribute.",
  },
  {
    name: "limit",
    type: "number",
    description: "Maximum number of matching elements to update. If not set (or if set to 0), all matching elements will be updatedgot add -git add ..",
  },
];

setAttribute.allowedContentTypes = ["*"];
setAttribute.parseValidators = [
  {
    test: (command) => {
      return command.hasArg("selector") && command.hasArg("attribute") && command.hasArg("value");
    },
    message: "You must provide a selector, attribute, and value.",
  },
];

export default setAttribute;
import { parseHtml } from "../helpers.js";

async function setAttribute(working, command, pipeline) {
  // Get all arguments upfront
  const selector = command.getArg("selector");
  const attribute = command.getArg("attribute");
  const value = command.getArg("value");
  const limit = Number(command.getArg("limit")) || 0;

  const doc = await parseHtml(working.text);
  const elements = Array.from(doc.querySelectorAll(selector));
  if (!elements.length) {
    pipeline.log(`Warning: No element found for selector: ${selector}`);
    return working.text;
  }

  const targets = limit === 0 ? elements : elements.slice(0, limit);
  targets.forEach((el) => el.setAttribute(attribute, value));
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
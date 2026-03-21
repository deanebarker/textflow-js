import { Helpers } from "../textflow.js";

async function wrapLines(working, command) {

  const tagName = command.getArg("tag,tagName") || "div";
  const classNames = command.getArg("class,className");
  const trim = command.getArg("trim") === "true" || command.getArg("trim") === true;
  const removeEmpty = command.getArg("remove-empty") === "true" || command.getArg("remove-empty") === true;

  const lines = working.text
    .split("\n")
    .map((line) => (trim ? line.trim() : line))
    .filter((line) => (removeEmpty ? line : true));

  const dom = await Helpers.getDom();

  return lines.map((line) => {

      const wrapper = dom.createElement(tagName);
      if (classNames) {
        for (const className of classNames.split(" ")) {
          wrapper.classList.add(className);
        }
      }

      wrapper.innerHTML = line;
      return wrapper.outerHTML;

  }
  ).join("\n");
}

// Meta
wrapLines.title = "Wrap Lines";
wrapLines.description = "Wrap lines in a tag.";
wrapLines.args = [
  {
    name: "trim",
    type: "boolean",
    description: "Whether to trim whitespace from each line.",
    default: false,
    allowedValues: ["true", "false", true, false],
  },
  {
    name: "remove-empty",
    type: "boolean",
    description: "Whether to remove empty lines after trimming.",
    default: false,
    allowedValues: ["true", "false", true, false],
  },
  {
    name: "tag",
    type: "string",
    description: "HTML tag name (default: div)",
  },
  {
    name: "class",
    type: "string",
    description: "CSS class names (space-separated)",
  },
];
wrapLines.parseValidators = [
  {
    test: (command) => {
      return command.getArg("tag")
        ? /^[a-zA-Z][a-zA-Z0-9]*$/.test(command.getArg("tag"))
        : true;
    },
    message: "If provided, the tag name must be a valid HTML tag name.",
  }
];

wrapLines.allowedContentTypes = ["plain", "*"];

export default wrapLines;

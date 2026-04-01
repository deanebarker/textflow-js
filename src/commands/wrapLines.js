import { getDom } from "../helpers.js";

async function wrapLines(working, command) {
  // Get all arguments upfront
  const tag = command.getArg("tag,tagName") || "div";
  const classArg = command.getArg("class,className");
  const trim = command.getArg("trim");
  const removeEmpty = command.getArg("remove-empty");

  const shouldTrim = trim === "true" || trim === true;
  const shouldRemoveEmpty = removeEmpty === "true" || removeEmpty === true;

  const lines = working.text
    .split("\n")
    .map((line) => (shouldTrim ? line.trim() : line))
    .filter((line) => (shouldRemoveEmpty ? line : true));

  const dom = await getDom();

  return lines.map((line) => {
      try {
        const wrapper = dom.createElement(tag);
        if (classArg) {
          for (const className of classArg.split(" ")) {
            wrapper.classList.add(className);
          }
        }

        wrapper.innerHTML = line;
        return wrapper.outerHTML;
      } catch (e) {
        throw new Error(`Failed to create element with tag "${tag}": ${e.message}`);
      }
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


export default wrapLines;

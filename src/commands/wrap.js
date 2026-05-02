import { getDom } from "../helpers.js";

const ATTR_PREFIXES = { attr_: "", data_: "data-", aria_: "aria-" };

function matchAttrPrefix(key) {
  return Object.keys(ATTR_PREFIXES).find((p) => key.startsWith(p)) || null;
}

async function wrap(working, command) {
  // Get all arguments upfront
  const tag = command.getArg("tag,tagName") || "div";
  const id = command.getArg("id");
  const classArg = command.getArg("class,className");
  const attrs = command.arguments
    .map((a) => {
      const prefix = matchAttrPrefix(a.key);
      if (!prefix) return null;
      return {
        name: ATTR_PREFIXES[prefix] + a.key.slice(prefix.length),
        value: command.getArg(a.key),
      };
    })
    .filter(Boolean);

  const wrapper = (await getDom()).createElement(tag);

  if (classArg) {
    for (const className of classArg.split(" ")) {
      wrapper.classList.add(className);
    }
  }

  if (id) {
    wrapper.setAttribute("id", id);
  }

  for (const attr of attrs) {
    wrapper.setAttribute(attr.name, attr.value);
  }

  wrapper.innerHTML = working.text;
  return wrapper.outerHTML;
}

// Meta
wrap.title = "Wrap Content";
wrap.description = "Wrap content in an HTML element with optional class and id attributes.";
wrap.args = [
  {
    name: "tag",
    type: "string",
    description: "HTML tag name (default: div)"
  },
  {
    name: "class",
    type: "string",
    description: "CSS class names (space-separated)",
  },
  {
    name: "id",
    type: "string",
    description: "Element ID"
  },
  {
    name: "attr_*",
    type: "string",
    description: "Wildcard: any argument named attr_<name> writes <name>=\"value\" to the opening tag (e.g. attr_href, attr_data-id, attr_aria-label).",
  },
  {
    name: "data_*",
    type: "string",
    description: "Wildcard: any argument named data_<name> writes data-<name>=\"value\" to the opening tag (e.g. data_foo -> data-foo).",
  },
  {
    name: "aria_*",
    type: "string",
    description: "Wildcard: any argument named aria_<name> writes aria-<name>=\"value\" to the opening tag (e.g. aria_label -> aria-label).",
  },
];
wrap.parseValidators = [
  {
    test: (command) => {
      return command.getArg("tag")
        ? /^[a-zA-Z][a-zA-Z0-9]*$/.test(command.getArg("tag"))
        : true;
    },
    message: "If provided, the tag name must be a valid HTML tag name.",
  },
  {
    test: (command) => {
      return command.arguments
        .filter((a) => matchAttrPrefix(a.key))
        .every((a) => /^[a-zA-Z][a-zA-Z0-9_:.-]*$/.test(a.key.slice(5)));
    },
    message: "Each attr_* / data_* / aria_* argument must use a valid HTML attribute name after the underscore.",
  },
];

export default wrap;

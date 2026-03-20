import { Helpers } from "../textflow.js";

async function wrap(working, command) {

  const tagName = command.getArg("tag,tagName") || "div";
  const id = command.getArg("id");
  const classNames = command.getArg("class,className");

  const wrapper = (await Helpers.getDom()).createElement(tagName);

  if (classNames) {
    for (const className of classNames.split(" ")) {
      wrapper.classList.add(className);
    }
  }

  if (id) {
    wrapper.setAttribute("id", id);
  }

  wrapper.innerHTML = working.text;
  return {
    text: wrapper.outerHTML,
    contentType: "text/html",
  };
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
];
wrap.allowedContentTypes = ["*"];
wrap.parseValidators = [
  {
    test: (command) => {
      return command.getArg("tag")
        ? /^[a-zA-Z][a-zA-Z0-9]*$/.test(command.getArg("tag"))
        : true;
    },
    message: "If provided, the tag name must be a valid HTML tag name.",
  },
];

export default wrap;

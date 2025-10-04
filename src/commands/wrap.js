function wrap(working, command, p) {
  let wrapper = document.createElement(command.getArg("tag,tagName") || "div");

  if (command.getArg("class,className")) {
    for (const className of command.getArg("class,className").split(" ")) {
      wrapper.classList.add(className);
    }
  }

  if (command.getArg("id")) {
    wrapper.setAttribute("id", command.getArg("id"));
  }

  wrapper.innerHTML = working.text;
  return {
    text: wrapper.outerHTML,
    contentType: "text/html",
  };
}
wrap.title = "Wrap Content";
wrap.description =
  "Wrap content in an HTML element with optional class and id attributes.";
wrap.args = [
  { name: "tag", type: "string", description: "HTML tag name (default: div)" },
  {
    name: "class",
    type: "string",
    description: "CSS class names (space-separated)",
  },
  { name: "id", type: "string", description: "Element ID" },
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

function extract(working, command, p) {
  const selector = command.getArg("selector");
  const first = command.getArg("first") || false;
  const scope = command.getArg("scope") || "outer";

  let el = document.createElement("html");
  el.innerHTML = working.text;
  if (first) {
    return getHtml(el.querySelector(selector), scope);
  } else {
    return Array.from(el.querySelectorAll(selector))
      .map((e) => getHtml(e, scope))
      .join("\n");
  }
}

// Meta
extract.title = "Extract Element";
extract.description =
  "Extract a specific element from HTML using CSS selectors. The outer HTML will be captured. If your selector matches multiple elements, they will be joined together.";
extract.args = [
  {
    name: "selector",
    type: "string",
    description: "CSS selector",
  },
  {
    name: "first",
    type: "boolean",
    description: "Extract only the first matching element (default: false)",
  },
  {
    name: "scope",
    type: "string",
    description:
      "Scope of extraction: 'inner', 'outer', 'text', or @attribute name (default: 'outer')",
  },
];
extract.allowedContentTypes = ["html"];
extract.parseValidators = [
  {
    test: (command) => {
      return command.getArg("selector");
    },
    message: "You must provide a CSS selector.",
  },
  {
    test: (command) => {
      const scope = command.getArg("scope");
      if (!scope) return true; // If they don't provide it, that's fine
      return (
        scope === "inner" ||
        scope === "outer" ||
        scope === "text" ||
        scope.startsWith("@")
      );
    },
    message:
      "Scope must be 'inner', 'outer', 'text', or an attribute name prefixed with '@'.",
  },
];
extract.allowFreeArguments = false;

function getHtml(element, scope) {
  if (scope == "inner") {
    return element.innerHTML;
  } else if (scope == "outer") {
    return element.outerHTML;
  } else if (scope == "text") {
    return element.textContent;
  } else if (scope.startsWith("@")) {
    return element.getAttribute(scope.slice(1)) || "";
  } else {
    throw new Error("Unknown scope: " + scope);
  }
}

export default extract;

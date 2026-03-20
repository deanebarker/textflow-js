import { Helpers } from "../textflow.js";

async function extract(working, command) {

  const selector = command.getArg("selector"); // the related test will fail if this is missing
  const scope = command.getArg("scope") || "outer";
  const limit = Number(command.getArg("limit")) || 0;
  const join = command.getArg("join") || "\n";

  const doc = await Helpers.parseHtml(working.text);

  // Get the elements
  let results = Array.from(doc.querySelectorAll(selector));

  // Cut off at the limit if there is one
  if (limit > 0) {
    results = results.slice(0, limit);
  }

  // Extract the correct string based on the scope
  results = results.map((element) => {
    if (scope == "inner") {
      return element.innerHTML;
    } else if (scope == "outer") {
      return element.outerHTML;
    } else if (scope == "text") {
      return element.textContent;
    } else if (scope && scope.startsWith("@")) {
      // QUESTION: do we filter for limit before or after we determine that attributes might be null? Do nulls count toward the limit?
      return element.getAttribute(scope.slice(1)) || null; // Nulls should be filtered out later
    } else {
      throw new Error("Unknown scope: " + scope);
    }
  });

  // Filter out nulls
  // QUESTION: see above, do we filter before or after limit? If before, then we might end up with fewer results than the limit if some attributes are missing. If after, then nulls would count toward the limit. I think it makes more sense to filter first, so that the limit applies to actual results rather than counting nulls.
  results = results.filter((r) => r !== null); // Filter out nulls (e.g. missing attributes )

  return results.join(join);
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
    name: "limit",
    type: "number",
    description: "Maximum number of elements to extract (default: 0, meaning no limit)",
  },
  {
    name: "scope",
    type: "string",
    description:
      "Scope of extraction: 'inner', 'outer', 'text', or @attribute name (default: 'outer')",
  },
  {
    name: "join",
    type: "string",
    description: "String to join multiple results with (default: '\\n')",
  }
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
      const limit = command.getArg("limit");
      const join = command.getArg("join");
      return !(limit === "1" && join !== null);
    },
    message: "Cannot use 'join' argument when 'limit' is set to 1."
  },
  {
    test: (command) => {
      const scope = command.getArg("scope");
      if (!scope) return true; // If they don't provide it, that's fine
      return (
        scope === "inner" ||
        scope === "outer" ||
        scope === "text" ||
        (scope && scope.startsWith("@"))
      );
    },
    message:
      "Scope must be 'inner', 'outer', 'text', or an attribute name prefixed with '@'.",
  },
];
extract.allowFreeArguments = false;

export default extract;

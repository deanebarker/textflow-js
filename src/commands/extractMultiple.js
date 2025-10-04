function extractMultiple(working, command, p) {
  const selector = command.getArg("pattern");
  let el = document.createElement("html");
  el.innerHTML = working.text;
  let parts = Array.from(el.querySelectorAll(selector));

  if (command.getArg("limit")) {
    parts = parts.slice(0, command.getArg("limit"));
  }

  if (command.getArg("remove")) {
    const remove = command.getArg("remove").split(",");
    for (const r of remove) {
      for (const p of parts) {
        for (const rem of p.querySelectorAll(r)) {
          rem.remove();
        }
      }
    }
  }

  if (command.getArg("wrap")) {
    let wrapper = document.createElement(command.getArg("wrap"));
    parts = parts.map((p) => {
      let w = wrapper.cloneNode();
      w.appendChild(p);
      return w;
    });
  }

  return parts.map((p) => p.outerHTML).join("");
}
extractMultiple.title = "Extract Multiple Elements";
extractMultiple.description =
  "Extract multiple elements from HTML using CSS selectors with optional filtering and wrapping.";
extractMultiple.args = [
  { name: "pattern", type: "string", description: "CSS selector pattern" },
  {
    name: "limit",
    type: "number",
    description: "Maximum number of elements to extract",
  },
  {
    name: "remove",
    type: "string",
    description:
      "CSS selectors for elements to remove from each extracted element (comma-separated)",
  },
  {
    name: "wrap",
    type: "string",
    description: "HTML tag name to wrap each extracted element",
  },
];
extractMultiple.allowedContentTypes = ["html"];

export default extractMultiple;

function outputVars(working, command, p) {
  
  const tagName = command.getArg("tagName") || "div";
  const id = command.getArg("id") || "textflow-vars";

  const tag = document.createElement(tagName);
  tag.id = id;
  tag.hidden = true;

  for (const [key, value] of p.vars) {
    tag.setAttribute(`data-var-${key}`, value);
  }

  working.text = working.text + tag.outerHTML;
}

// Meta
outputVars.title = "Output Variables";
outputVars.description = "Output all variables and their values to a hidden HTML element.";
outputVars.args = [
  {
    name: "tagName",
    description: "The HTML tag to use for the container element (default: 'div').",
    default: "div",
  },
  {
    name: "id",
    description: "The ID to assign to the container element (default: 'textflow-vars').",
    default: "textflow-vars",
  },
];
outputVars.allowedContentTypes = ["plain", "html", "json", "*"];
outputVars.parseValidators = [];


export default outputVars;
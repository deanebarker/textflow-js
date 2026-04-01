import { getLiquidEngine } from "../helpers.js";

async function templateJson(working, command, p) {
  // Get all arguments upfront
  const template = command.getArg("template");
  const url = command.getArg("url");
  const selector = command.getArg("selector");

  if (template == null && url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch template from ${url}: ${response.status} ${response.statusText}`);
    }
    template = await response.text();
  }

  if (template == null && selector) {
    const el = document.querySelector(selector);
    if (!el) {
      throw new Error(`Selector "${selector}" did not match any elements`);
    }
    template = el.innerHTML;
  }

  const engine = getLiquidEngine();
  let data;
  try {
    data = JSON.parse(working.text);
  } catch (e) {
    throw new Error(`Invalid JSON in working text: ${e.message}`);
  }
  const renderedText = await engine.parseAndRender(template, {
    data: data,
    vars: p.vars,
  });
  return renderedText;
}

// Meta
templateJson.title = "Template JSON";
templateJson.description =
  "Apply a Liquid template to JSON data to generate HTML. The entire working data is injected as an object in a variable called 'data'.";
templateJson.args = [
  {
    name: "template",
    type: "string",
    description: "Liquid template string",
  },
  {
    name: "url",
    type: "string",
    description: "URL to fetch template from",
  },
  {
    name: "selector",
    type: "string",
    description: "CSS selector to get template from DOM",
  },
];
templateJson.parseValidators = [
  {
    test: (command) => {
      return (
        command.hasArg("template") ||
        command.hasArg("url") ||
        command.hasArg("selector")
      );
    },
    message:
      "You must provide a template, a URL to fetch a template from, or a templateSelector.",
  },
];

export default templateJson;

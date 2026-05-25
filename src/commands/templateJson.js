import { getLiquidEngine } from "../helpers.js";

async function templateJson(working, command, p) {
  // Get all arguments upfront
  const template = command.getArg("source,template");
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

  // TODO: I need to figure out a Node equivalent
  const engine = getLiquidEngine();
  if (typeof window !== "undefined" && window.liquidFilters) {
    for (const [name, fn] of Object.entries(window.liquidFilters)) {
      engine.registerFilter(name, fn);
    }
  }

  let data;
  try {
    data = JSON.parse(working.text);
  } catch (e) {
    // If it's not JSON, just inject it as a string
    data = working.text;
  }
  

  try{
    const renderedText = await engine.parseAndRender(template, {
      data: data,
      vars: Object.fromEntries(working.vars),
    });
    return renderedText;
  } catch(e) {
    throw new Error(`Error rendering template: ${e.message}`);
  }
}

// Meta
templateJson.title = "Template";
templateJson.description =
  "Apply a Liquid template to the working data. The entire working data is injected as an object or string in a variable called 'data'. Variables are injected as a variable called 'vars'.";
templateJson.args = [
  {
    name: "template",
    type: "string",
    description: "Liquid template string",
  },
  {
    name: "source",
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
        command.hasArg("source") ||
        command.hasArg("url") ||
        command.hasArg("selector")
      );
    },
    message:
      "You must provide a template, a URL to fetch a template from, or a templateSelector.",
  },
];


export default templateJson;

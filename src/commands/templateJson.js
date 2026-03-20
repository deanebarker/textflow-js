import { Liquid } from "liquidjs";

async function templateJson(working, command, p) {
  let template = command.getArg("template");

  if (template == null && command.getArg("url")) {
    const response = await fetch(command.getArg("url"));
    template = await response.text();
  }

  if (template == null && command.getArg("selector")) {
    template = document.querySelector(command.getArg("selector")).innerHTML;
  }

  const engine = new Liquid();
  const data = JSON.parse(working.text);
  const renderedText = await engine.parseAndRender(template, {
    data: data,
    vars: p.vars,
  });
  return renderedText;
}

// Meta
templateJson.title = "Template JSON";
templateJson.description = "Apply a Liquid template to JSON data to generate HTML. The entire working data is injected as an object in a variable called 'data'.";
templateJson.args = [
  {
    name: "template",
    type: "string",
    description: "Liquid template string"
  },
  {
    name: "url",
    type: "string",
    description: "URL to fetch template from"
  },
  {
    name: "selector",
    type: "string",
    description: "CSS selector to get template from DOM",
  },
];
templateJson.allowedContentTypes = ["json"];
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

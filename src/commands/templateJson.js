import { Liquid } from "https://cdn.jsdelivr.net/npm/liquidjs@10.21.1/+esm";

async function templateJson(working, command, p) {
  let template = command.getArg("template");

  if (command.getArg("url,templateUrl")) {
    let response = await fetch(command.getArg("url,templateUrl"));
    template = await response.text();
  } else if (command.getArg("templateSelector")) {
    template = document.querySelector(
      command.getArg("templateSelector")
    ).innerHTML;
  }

  const engine = new Liquid();
  const data = JSON.parse(working.text);
  const renderedText = await engine.parseAndRender(template, { data: data });
  return {
    text: renderedText,
    contentType: "text/html",
  };
}

// Meta
templateJson.title = "Template JSON";
templateJson.description =
  "Apply a Liquid template to JSON data to generate HTML. The entire working data is injected as an object in a variable called 'data'.";
templateJson.args = [
  { name: "template", type: "string", description: "Liquid template string" },
  { name: "url", type: "string", description: "URL to fetch template from" },
  {
    name: "templateSelector",
    type: "string",
    description: "CSS selector to get template from DOM",
  },
];
templateJson.allowedContentTypes = ["json"];
templateJson.parseValidators = [
  {
    test: (command) => {
      return (
        command.getArg("template") ||
        command.getArg("url,templateUrl") ||
        command.getArg("templateSelector")
      );
    },
    message:
      "You must provide a template, a URL to fetch a template from, or a templateSelector.",
  },
];

export default templateJson;

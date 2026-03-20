import { Liquid, Drop } from "liquidjs";
import { Helpers } from "../textflow.js";

async function templateHtml(working, command, p) {

  HtmlDomDrop.parser = Helpers.parseHtml;

  let template = command.getArg("template");

  if (template == null && command.getArg("url")) {
    const response = await fetch(command.getArg("url"));
    template = await response.text();
  }

  if (template == null && command.getArg("selector")) {
    template = document.querySelector(
      command.getArg("selector")
    ).innerHTML;
  }

  const engine = new Liquid();
  const renderedText = await engine.parseAndRender(template, {
    data: working.text,
    html: await HtmlDomDrop.fromHtml(working.text),
    vars: p.vars
  });
  return renderedText;
}

// Meta
templateHtml.title = "Template HTML";
templateHtml.description =
  "Apply a Liquid template to HTML data with DOM access. Use one of the available arguments to specify where the template source can be found. The entire working data is injected as a string in a variable called 'data', and as a DOM-accessible object in a variable called 'html'.";
templateHtml.args = [
  { name: "template", type: "string", description: "Liquid template string" },
  { name: "url", type: "string", description: "URL to fetch template from" },
  {
    name: "selector",
    type: "string",
    description: "CSS selector to get template from DOM",
  },
];
templateHtml.allowedContentTypes = ["html"];

// Helpers

class AttrDrop extends Drop {
  constructor(node) {
    super();
    this.node = node;
  }
  liquidMethodMissing(name) {
    if (!name || typeof name !== "string") return undefined;
    const el = this.node && this.node.getAttribute ? this.node : null;
    return el ? el.getAttribute(name) : null;
  }
}

class HtmlDomDrop extends Drop {
  constructor(node) {
    super();
    this.node = node;
  }

  static parser;

  static async fromHtml(html) {
    const doc = await HtmlDomDrop.parser(html);
    return new HtmlDomDrop(doc);
  }

  liquidMethodMissing(key) {
    if (typeof key !== "string") return undefined;

    if (key === "attr") return new AttrDrop(this.node);

    if (key === "innerHTML") {
      if (this.node && "innerHTML" in this.node) return this.node.innerHTML;
      const root = this.node && this.node.documentElement;
      return root ? root.innerHTML : "";
    }

    if (key === "outerHTML") {
      if (this.node && "outerHTML" in this.node) return this.node.outerHTML;
      const root = this.node && this.node.documentElement;
      return root ? root.outerHTML : "";
    }

    const root = this.node;
    if (!root || !root.querySelectorAll) return [];
    const list = root.querySelectorAll(key);
    return Array.from(list, (el) => new HtmlDomDrop(el));
  }
}

export default templateHtml;

import {
  Liquid,
  Drop,
} from "https://cdn.jsdelivr.net/npm/liquidjs@10.21.1/+esm";

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

  static fromHtml(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
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

async function templateHtml(working, command, p) {
  let template = command.getArg("template");

  if (command.getArg("url")) {
    let response = await fetch(command.getArg("url"));
    template = await response.text();
  } else if (command.getArg("templateSelector")) {
    template = document.querySelector(
      command.getArg("templateSelector")
    ).innerHTML;
  }

  const engine = new Liquid();
  const renderedText = await engine.parseAndRender(template, {
    data: working.text,
    html: HtmlDomDrop.fromHtml(working.text),
  });
  return {
    text: renderedText,
    contentType: "text/html",
  };
}
templateHtml.title = "Template HTML";
templateHtml.description =
  "Apply a Liquid template to HTML data with DOM access. Use one of the available arguments to specify where the template source can be found. The entire working data is injected as a string in a variable called 'data', and as a DOM-accessible object in a variable called 'html'.";
templateHtml.args = [
  { name: "template", type: "string", description: "Liquid template string" },
  { name: "url", type: "string", description: "URL to fetch template from" },
  {
    name: "templateSelector",
    type: "string",
    description: "CSS selector to get template from DOM",
  },
];
templateHtml.allowedContentTypes = ["html"];

export default templateHtml;

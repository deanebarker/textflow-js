import { parseHtml } from "../helpers.js";

async function absolutize(working, command, p) {

  const url = command.getArg("url") ?? working.source;

  const doc = await parseHtml(working.text);

  // Resolve links
  doc.querySelectorAll("a[href]").forEach((a) => {
    a.setAttribute("href", resolveUrl(a.getAttribute("href"), url));
  });

  // Resolve images
  doc.querySelectorAll("img[src]").forEach((img) => {
    img.setAttribute("src", resolveUrl(img.getAttribute("src"), url));
  });

  // Serialize DOM back to string
  return doc.body.innerHTML;
}

// Meta

absolutize.title = "Absolutize URLs";
absolutize.description = "Convert relative URLs to absolute based on source URL. By default this operates on the URL the original pipeline input was retrieved from.";
absolutize.args = [
  {
    name: "url",
    type: "string",
    description: "The base URL with which to calculate the new links. If not provided, the source URL will be used.",
  },
];
absolutize.allowedContentTypes = ["html"];
absolutize.parseValidators = [
  {
    test: (command) => {
      if (command.getArg("url") && !isAbsoluteUrl(command.getArg("url"))) {
        return false;
      }
      return true;
    },
    message: "If you provide a URL, it must be an absolute URL.",
  },
];

// Helpers

function resolveUrl(relative, baseUrl) {
  try {
    return new URL(relative, baseUrl).href;
  } catch {
    return relative; // leave it unchanged if it's not a valid URL
  }
}

function isAbsoluteUrl(str) {
  try {
    new URL(str.trim()); // no base ⇒ throws on relative inputs
    return true;
  } catch {
    return false;
  }
}

export default absolutize;
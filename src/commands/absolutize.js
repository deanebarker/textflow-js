function absolutize(working, command, p) {
  let url = command.getArg("url") ?? working.source;

  const baseUrl = new URL(url);

  return absolutizeHtml(working.text, baseUrl);
}

// Meta
absolutize.title = "Absolutize URLs";
absolutize.description =
  "Convert relative URLs to absolute based on source URL. By default this operates on the URL the original pipeline input was retrieved from.";
absolutize.args = [
  {
    name: "url",
    type: "string",
    description:
      "The base URL with which to calculate the new links. If not provided, the source URL will be used.",
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
export function isAbsoluteUrl(str) {
  if (typeof str !== "string") return false;
  try {
    new URL(str.trim()); // no base ⇒ throws on relative inputs
    return true;
  } catch {
    return false;
  }
}

function absolutizeHtml(htmlString, baseUrl) {
  // Create a temporary DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // Helper to resolve a URL
  function resolveUrl(relative) {
    try {
      return new URL(relative, baseUrl).href;
    } catch {
      return relative; // leave it unchanged if it's not a valid URL
    }
  }

  // Fix all <a> tags
  doc.querySelectorAll("a[href]").forEach((a) => {
    a.setAttribute("href", resolveUrl(a.getAttribute("href")));
  });

  // Fix all <img> tags
  doc.querySelectorAll("img[src]").forEach((img) => {
    img.setAttribute("src", resolveUrl(img.getAttribute("src")));
  });

  // Serialize DOM back to string
  return doc.documentElement.outerHTML;
}

export default absolutize;

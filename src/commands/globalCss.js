import { sha256Hash } from "../utils.js";

async function globalCss(working, command, p) {
  const css = command.getArg("css");

  if (typeof document === "undefined") {
    return working.text;
  }

  const hash = await sha256Hash(css);
  const id = "ue-global-css-" + hash;

  if (document.getElementById(id)) {
    return working.text;
  }

  if (css.startsWith("https://") || css.startsWith("http://")) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = css;
    document.head.appendChild(link);
  } else {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }

  return working.text;
}



globalCss.title = "Global CSS";
globalCss.description =
  "Inject a stylesheet into the document head (once per unique CSS). Accepts either inline CSS or a URL to a remote stylesheet.";
globalCss.args = [
  {
    name: "css",
    type: "string",
    description: "Inline CSS or a URL (http:// or https://) to a stylesheet.",
  },
];
globalCss.parseValidators = [
  {
    test: (command) => command.hasArg("css"),
    message: "You must provide a 'css' argument with inline CSS or a stylesheet URL.",
  },
];

export default globalCss;

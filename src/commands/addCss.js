async function addCss(working, command, p) {
  let css = command.getArg("css");
  let url = command.getArg("url");
  if (url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `Failed to fetch CSS from ${url}: ${res.status} ${res.statusText}`
      );
    }
    css = await res.text();
  }
  if (!css) {
    throw new Error("No CSS provided.");
  }
  return working.text + "\n" + `<style>${css}</style>`;
}
addCss.title = "Add CSS";
addCss.description = "Add a block of CSS to the embedded content.";
addCss.args = [
  { name: "css", type: "string", description: "The CSS to add." },
  { name: "url", type: "string", description: "A URL to fetch CSS from." },
];
addCss.allowedContentTypes = ["html"];
addCss.parseValidators = [
  {
    test: (command) => {
      return command.getArg("css") || command.getArg("url");
    },
    message:
      "You must provide a 'css' argument or a 'url' argument with a URL to a CSS file.",
  },
];

export default addCss;

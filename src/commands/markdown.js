import markdownit from "https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm";

function markdown(working, command, p) {
  // Use the markdown-it library if available
  if (typeof markdownit === "undefined") {
    console.warn("markdown-it library is not available");
    return working;
  }

  const md = markdownit();
  return md.render(working.text);
}

// Meta
markdown.title = "Markdown";
markdown.description =
  "Convert Markdown text to HTML using markdown-it parser.";
markdown.args = [];
markdown.allowedContentTypes = ["markdown", "plain"];

export default markdown;

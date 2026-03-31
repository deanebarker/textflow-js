import markdownit from "https://cdn.jsdelivr.net/npm/markdown-it@14.1.1/+esm";

// Add the markdown command to the TextFlow pipeline when it's created
document.addEventListener("textflow:pipeline-created", (event) => {
  event.detail.pipeline.instanceCommandLib.set("markdown", markdown);
  console.log("Markdown command added to TextFlow pipeline");
});

function markdown(working, command, p) {
  const md = markdownit();
  return md.render(working.text);
}

// Meta
markdown.title = "Markdown";
markdown.description =
  "Convert Markdown text to HTML using markdown-it parser.";
markdown.args = [];
markdown.allowedContentTypes = ["markdown", "plain"];
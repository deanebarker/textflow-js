function newLines(working, command, p) {
  const lines = working.text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.join("<br>");
}
newLines.title = "New Lines";
newLines.description = "Convert line breaks to HTML line-break tags.";
newLines.args = [];
newLines.allowedContentTypes = ["plain", "*"];

export default newLines;

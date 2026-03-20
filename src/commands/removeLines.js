function removeLines(working, command, p) {
  const linesToRemove = command.getArg("lines");
  const from = command.getArg("from") || "start";
  const regex = command.getArg("regex");

  let lines = working.text.split("\n");

  if (regex) {
    const pattern = new RegExp(regex);
    lines = lines.filter((l) => !pattern.test(l));
  }

  if (from === "start") {
    return lines.slice(linesToRemove).join("\n");
  } else if (from === "end") {
    return lines.slice(0, -linesToRemove).join("\n");
  }

  return working.text;
}

// Meta
removeLines.title = "Remove Lines";
removeLines.description = "Remove lines from the text.";
removeLines.args = [
  {
    name: "lines",
    type: "number",
    description: "The number of lines to remove from the start of the text.",
  },
  {
    name: "from",
    type: "string",
    description: "The direction to remove lines from (start or end).",
  },
  {
    name: "regex",
    type: "string",
    description: "A regular expression to match lines to remove.",
  },
];
removeLines.allowedContentTypes = ["html"];
removeLines.parseValidators = [
  {
    test: (command) => {
      if (command.hasArg("lines") || command.hasArg("regex")) {
        return true;
      }
      return false;
    },
    message:
      "You must provide either a 'lines' argument or a 'regex' argument.",
  },
  {
    test: (command) => {
      const lines = command.getArg("lines");
      if (isNaN(lines) || lines < 0) return false;
      return true;
    },
    message: "The number of lines to remove must be a non-negative number.",
  },
];

export default removeLines;

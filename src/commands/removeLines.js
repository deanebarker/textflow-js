function removeLines(working, command, p) {
  const lines_arg = command.getArg("lines");
  const fromArg = command.getArg("from") || "start";
  const regex = command.getArg("regex");

  let lines = working.text.split("\n");

  if (regex) {
    try {
      const pattern = new RegExp(regex);
      lines = lines.filter((l) => !pattern.test(l));
    } catch (e) {
      throw new Error(`Invalid regex pattern "${regex}": ${e.message}`);
    }
  }

  if (fromArg === "start") {
    return lines.slice(lines_arg).join("\n");
  } else if (fromArg === "end") {
    return lines.slice(0, -lines_arg).join("\n");
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
    allowedValues: ["start", "end"],
  },
  {
    name: "regex",
    type: "string",
    description: "A regular expression to match lines to remove.",
  },
];
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
      if (!command.hasArg("lines")) return true; // If lines not provided, that's OK (regex might be used instead)
      const lines = command.getArg("lines");
      const numLines = Number(lines);
      if (isNaN(numLines) || numLines < 0) return false;
      return true;
    },
    message: "The number of lines to remove must be a non-negative number.",
  },
];

export default removeLines;

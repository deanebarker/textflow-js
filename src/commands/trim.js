function trim(working, command, p) {
  const char = command.getArg("char");
  const scope = command.getArg("scope") ?? "both";

  if (scope && !["start", "end", "both"].includes(scope)) {
    throw new Error(
      `The 'scope' argument must be "start", "end", or "both", got "${scope}"`
    );
  }

  let result = working.text;

  // Determine what to trim
  const shouldTrimStart = scope === "start" || scope === "both";
  const shouldTrimEnd = scope === "end" || scope === "both";

  if (char) {
    // Trim specific character
    if (shouldTrimStart) {
      let startIndex = 0;
      while (startIndex < result.length && result[startIndex] === char) {
        startIndex++;
      }
      result = result.substring(startIndex);
    }

    if (shouldTrimEnd) {
      let endIndex = result.length - 1;
      while (endIndex >= 0 && result[endIndex] === char) {
        endIndex--;
      }
      result = result.substring(0, endIndex + 1);
    }
  } else {
    // Trim whitespace
    if (shouldTrimStart) {
      result = result.replace(/^\s+/, "");
    }

    if (shouldTrimEnd) {
      result = result.replace(/\s+$/, "");
    }
  }

  return result;
}

trim.title = "Trim";
trim.description =
  "Remove whitespace or a specific character from the start, end, or both sides of the text.";
trim.args = [
  {
    name: "char",
    type: "string",
    description: "The specific character to trim (defaults to whitespace)",
  },
  {
    name: "scope",
    type: "string",
    description: 'Where to trim: "start", "end", or "both" (defaults to "both")',
  },
];

export default trim;

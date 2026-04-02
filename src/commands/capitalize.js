function capitalize(working, command, p) {
  const excludeArg = command.getArg("exclude") || "";
  const excludeSet = new Set(
    excludeArg
      .split(",")
      .map((word) => word.trim().toLowerCase())
      .filter((word) => word.length > 0)
  );

  return working.text
    .split(/(\s+)/)
    .map((token) => {
      // Preserve whitespace tokens as-is
      if (/^\s+$/.test(token)) {
        return token;
      }

      // Extract word and trailing punctuation
      const match = token.match(/^(\W*)(\w+)([\W]*)$/);
      if (!match) {
        return token;
      }

      const [, leadingPunc, word, trailingPunc] = match;
      const lowerWord = word.toLowerCase();

      // If word is in exclude list, keep original case
      if (excludeSet.has(lowerWord)) {
        return leadingPunc + word + trailingPunc;
      }

      // Capitalize first letter, lowercase the rest
      const capitalized = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      return leadingPunc + capitalized + trailingPunc;
    })
    .join("");
}

// Meta
capitalize.title = "Capitalize";
capitalize.description = "Capitalize the first letter of each word. Optionally exclude specific words from capitalization.";
capitalize.args = [
  {
    name: "exclude",
    type: "string",
    description: "Comma-delimited list of words to exclude from capitalization (case-insensitive).",
    required: false,
  },
];
capitalize.parseValidators = [];

export default capitalize;

function removeBefore(working, command, p) {
  const char = command.getArg("char");
  const index = command.getArg("index") ?? 1;
  const inclusive = command.getArg("inclusive") ?? false;

  if (!char) {
    throw new Error("The 'char' argument is required for removeBefore command");
  }

  const indexNum = Number(index);
  if (isNaN(indexNum) || indexNum < 1) {
    throw new Error(`The 'index' argument must be a positive number, got ${index}`);
  }

  // Find the index-th occurrence of the character
  let count = 0;
  for (let i = 0; i < working.text.length; i++) {
    if (working.text[i] === char) {
      count++;
      if (count === indexNum) {
        const startIndex = inclusive ? i + 1 : i;
        return working.text.substring(startIndex);
      }
    }
  }

  // Character not found at the specified index
  return working.text;
}

removeBefore.title = "Remove Before";
removeBefore.description =
  "Remove all text before the specified character occurrence, returning the text from that character onwards, optionally including or excluding the character itself.";
removeBefore.args = [
  {
    name: "char",
    type: "string",
    description: "The character to find (required)",
  },
  {
    name: "index",
    type: "number",
    description: "Which occurrence of the character to use (defaults to 1)",
  },
  {
    name: "inclusive",
    type: "string",
    description: "If true, also removes the designated character; if false, keeps it (defaults to false)",
  },
];
removeBefore.parseValidators = [
  {
    test: (command) => command.hasArg("char"),
    message: "You must provide a 'char' argument specifying which character to find",
  },
];

export default removeBefore;

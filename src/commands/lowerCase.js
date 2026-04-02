function lowerCase(working, command, p) {
  return working.text.toLowerCase();
}

// Meta
lowerCase.title = "Lower Case";
lowerCase.description = "Convert the working text to lowercase.";
lowerCase.args = [];
lowerCase.parseValidators = [];

export default lowerCase;

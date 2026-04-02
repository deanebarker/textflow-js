function upperCase(working, command, p) {
  return working.text.toUpperCase();
}

// Meta
upperCase.title = "Upper Case";
upperCase.description = "Convert the working text to uppercase.";
upperCase.args = [];
upperCase.parseValidators = [];

export default upperCase;

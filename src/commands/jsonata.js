import jsonata from "jsonata";

async function jsonataQuery(working, command, p) {
  const expr = command.getArg("expr");

  const data = JSON.parse(working.text);

  let result;
  try {
    result = await jsonata(expr).evaluate(data);
  } catch (e) {
    throw new Error(`JSONata expression failed to evaluate: ${e.message}`);
  }

  return JSON.stringify(result);
}

// Meta

jsonataQuery.title = "JSONata Query";
jsonataQuery.description = "Apply a JSONata expression to transform JSON data.";
jsonataQuery.args = [
  {
    name: "expr",
    type: "string",
    description: "JSONata expression to evaluate",
  },
];
jsonataQuery.parseValidators = [
  {
    test: (command) => {
      return command.hasArg("expr");
    },
    message: "You must provide a JSONata expression.",
  },
];

export default jsonataQuery;

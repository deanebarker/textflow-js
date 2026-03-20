import jsonata from "jsonata";

async function jsonataQuery(working, command, p) {
  let expr = command.getArg("expr", command);
  const result = await jsonata(expr).evaluate(JSON.parse(working.text));
  return {
    text: JSON.stringify(result),
    contentType: "application/json",
  };
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
jsonataQuery.allowedContentTypes = ["json"];
jsonataQuery.parseValidators = [
  {
    test: (command) => {
      return command.hasArg("expr");
    },
    message: "You must provide a JSONata expression.",
  },
];

export default jsonataQuery;

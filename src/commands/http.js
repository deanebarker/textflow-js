async function http(working, command, p) {
  const url = command.getArg("url");
  const method = command.getArg("method")?.toUpperCase() ?? "GET";

  // Build headers from header_* arguments
  const headers = {};
  for (const arg of command.arguments) {
    if (arg.key.startsWith("header_")) {
      headers[arg.key.slice(7)] = arg.value;
    }
  }

  // Determine body: explicit body arg, or working.text for mutating methods
  const explicitBody = command.getArg("body");
  const sendsBody = ["POST", "PUT", "PATCH"].includes(method);
  const body = explicitBody ?? (sendsBody ? working.text : undefined);

  const response = await fetch(url, {
    method,
    headers: Object.keys(headers).length ? headers : undefined,
    body,
  });

  if (!response.ok) {
    p.log(`HTTP failed: ${response.status} ${response.statusText}`);
    working.abort = true;
    return working;
  }

  const text = await response.text();
  return {
    text,
    contentType: response.headers.get("content-type"),
    source: url,
  };
}

// Meta

http.title = "HTTP Request";
http.description = "Fetch content from a URL using an HTTP request.";
http.args = [
  { name: "url", type: "string", description: "URL to fetch content from" },
  {
    name: "method",
    type: "string",
    description:
      "HTTP method to use (GET, POST, PUT, PATCH, DELETE, etc.). Defaults to GET.",
  },
  {
    name: "body",
    type: "string",
    description:
      "Body to send with the request. If omitted and method is POST, PUT, or PATCH, working.text is sent as the body.",
  },
  {
    name: "header_*",
    type: "string",
    description:
      "Headers to include in the request. The portion after header_ becomes the header name (e.g. header_Authorization sends an Authorization header).",
  },
];
http.allowedContentTypes = ["*"];
http.parseValidators = [
  {
    test: (command) => command.hasArg("url"),
    message: "You must provide a URL to fetch.",
  },
];

export default http;

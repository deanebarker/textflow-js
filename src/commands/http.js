async function http(working, command, p) {
  let url = command.getArg("url");
  const response = await fetch(url);
  if (!response.ok) {
    p.log(`HTTP failed: ${response.status} ${response.statusText}`);
    working.abort = true;
    return working;
  }
  const text = await response.text();
  return {
    text: text,
    contentType: response.headers.get("content-type"),
    source: url,
  };
}
http.title = "HTTP GET";
http.description = "Fetch content from a URL using HTTP request.";
http.args = [
  {
    name: "method",
    type: "string",
    description: "HTTP method to use (GET, POST, etc.)",
  },
  { name: "url", type: "string", description: "URL to fetch content from" },
  {
    name: "header_*",
    type: "object",
    description: "Headers to include in the request",
  },
];
http.allowedContentTypes = ["*"];
http.parseValidators = [
  {
    test: (command) => {
      return command.getArg("url");
    },
    message: "You must provide a URL to fetch.",
  },
];

export default http;

async function http(working, command, p) {
  const url = command.getArg("url");
  const method = command.getArg("method")?.toUpperCase() ?? "GET";

  // If we have a bad URL, then don't even try
  if(!isValidURL(url)) {
    p.log(`Invalid URL: "${url}". Please provide a valid absolute or root-relative URL.`);
    working.goto = "http-error-url,error";
    return working.text;
  }

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

  let responseBody = null;
  let errorCode = null;
  let response = null;
  let statusCode = 0;
  let statusText = null;

  try {
    response = await fetch(url, {
      method,
      headers: Object.keys(headers).length ? headers : undefined,
      body,
    });
    responseBody = await response.text();

    statusCode = response.status;
    statusText = response.statusText;

    // Store the error code, if any, for use in error handling
    errorCode =
      errorCode || (response && response.status >= 400)
        ? response.status
        : null;
  }
  catch (e)
  {
    // This is most likely a CORS error...
    // NOTE: It is not possible to detect CORS issues from code
    p.log(`Failed to fetch content from URL. This may be due to a CORS error or network issue. Error details: ${e.message}`);
    errorCode = "unknown";
  }

  // Error handling
  if (errorCode) {
    p.log(`HTTP failed: ${errorCode} ${statusText ?? "(no response)"}`);

    // Send back a list of labels that can be tried for error handling in descending order of specificity
    const errorLabels = [
      `http-error-${errorCode}`, /// Ex: http-error-404
      `http-error-${errorCode.toString()[0]}xx`, // Ex: http-error-4xx for any 4xx error
      "http-error",
      "error",
    ];
    if (command.hasArg("on-error")) {
      errorLabels.unshift(command.getArg("on-error")); //If they provided an error label, it gets priority
    }
    working.goto = errorLabels.join(",");

    // If no jump target is specified, abort the pipeline
    if (!working.goto) {
      p.log(`No on-error jump target specified, aborting pipeline.`);
      working.abort = true;
      return;
    }

    return working.text;
  }

  return responseBody;
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
  {
    name: "on-error",
    type: "string",
    description:
      "Optional label to jump to on error. If not provided, will try http-error-{code}, http-error-{code category} (e.g. 4xx), http-error, and error in that order.",
  }
];
http.parseValidators = [
  {
    test: (command) => command.hasArg("url"),
    message: "You must provide a URL to fetch.",
  },
];

// Helpers

function isValidURL(str) {
  // Check if we're in a browser environment with a current page URL
  const hasBrowserContext =
    typeof window !== "undefined" && window.location.href;

  // Absolute URLs (http/https) - always valid
  if (/^https?:\/\//.test(str)) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  // If no browser context, absolute URL is required
  if (!hasBrowserContext) {
    return false;
  }

  // With browser context: root-relative URLs (/path) are valid
  if (str.startsWith("/")) {
    return true;
  }

  // With browser context: relative URLs are valid if they resolve
  if (!str.includes("://") && !str.startsWith("#")) {
    try {
      new URL(str, window.location.href);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export default http;

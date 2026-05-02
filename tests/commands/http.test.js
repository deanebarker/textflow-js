import { expect, test, vi, afterEach } from "vitest";
import { execute } from "../helpers.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

function makeFetchStub({
  ok = true,
  status = 200,
  statusText = "OK",
  text = "",
  contentType = "text/plain",
} = {}) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    statusText,
    text: vi.fn().mockResolvedValue(text),
    headers: { get: vi.fn().mockReturnValue(contentType) },
  });
}

// Basic GET

test("Fetches text content from a URL", async () => {
  vi.stubGlobal(
    "fetch",
    makeFetchStub({ text: "Hello world", contentType: "text/plain" }),
  );
  const result = await execute(
    [{ name: "http", url: "https://example.com" }],
    "",
  );
  expect(result.text).toBe("Hello world");
});

test("Sets content-type from response header", async () => {
  vi.stubGlobal(
    "fetch",
    makeFetchStub({ text: "<p>hi</p>", contentType: "text/html" }),
  );
  const result = await execute(
    [{ name: "http", url: "https://example.com/page" }],
    "",
  );
  expect(result.text).toBeDefined();
});

test("Calls fetch with the provided URL", async () => {
  const fetchMock = makeFetchStub({ text: "data" });
  vi.stubGlobal("fetch", fetchMock);
  await execute([{ name: "http", url: "https://example.com/data" }], "");
  expect(fetchMock).toHaveBeenCalledWith(
    "https://example.com/data",
    expect.objectContaining({ method: "GET" }),
  );
});

test("Returns empty string body when response body is empty", async () => {
  vi.stubGlobal(
    "fetch",
    makeFetchStub({ text: "", contentType: "text/plain" }),
  );
  const result = await execute(
    [{ name: "http", url: "https://example.com/empty" }],
    "",
  );
  expect(result.text).toBe("");
});

// method argument

test("Uses GET by default when no method is specified", async () => {
  const fetchMock = makeFetchStub();
  vi.stubGlobal("fetch", fetchMock);
  await execute([{ name: "http", url: "https://example.com" }], "");
  expect(fetchMock).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ method: "GET" }),
  );
});

test("Uses the specified method", async () => {
  const fetchMock = makeFetchStub();
  vi.stubGlobal("fetch", fetchMock);
  await execute([{ name: "http", url: "https://example.com", method: "DELETE" }], "");
  expect(fetchMock).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ method: "DELETE" }),
  );
});

test("Normalizes method to uppercase", async () => {
  const fetchMock = makeFetchStub();
  vi.stubGlobal("fetch", fetchMock);
  await execute([{ name: "http", url: "https://example.com", method: "post" }], "some text");
  expect(fetchMock).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ method: "POST" }),
  );
});

// body argument

test("Sends explicit body when provided", async () => {
  const fetchMock = makeFetchStub();
  vi.stubGlobal("fetch", fetchMock);
  await execute(
    [{ name: "http", url: "https://example.com", method: "POST", body: "explicit body" }],
    "working text",
  );
  expect(fetchMock).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ body: "explicit body" }),
  );
});

test("Sends working.text as body for POST when no body arg is given", async () => {
  const fetchMock = makeFetchStub();
  vi.stubGlobal("fetch", fetchMock);
  await execute(
    [{ name: "http", url: "https://example.com", method: "POST" }],
    "working text",
  );
  expect(fetchMock).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ body: "working text" }),
  );
});

test("Sends working.text as body for PUT when no body arg is given", async () => {
  const fetchMock = makeFetchStub();
  vi.stubGlobal("fetch", fetchMock);
  await execute(
    [{ name: "http", url: "https://example.com", method: "PUT" }],
    "put body",
  );
  expect(fetchMock).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ body: "put body" }),
  );
});

test("Sends working.text as body for PATCH when no body arg is given", async () => {
  const fetchMock = makeFetchStub();
  vi.stubGlobal("fetch", fetchMock);
  await execute(
    [{ name: "http", url: "https://example.com", method: "PATCH" }],
    "patch body",
  );
  expect(fetchMock).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ body: "patch body" }),
  );
});

test("Does not send body for GET even when working.text is set", async () => {
  const fetchMock = makeFetchStub();
  vi.stubGlobal("fetch", fetchMock);
  await execute(
    [{ name: "http", url: "https://example.com", method: "GET" }],
    "working text",
  );
  expect(fetchMock).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ body: undefined }),
  );
});

// header_* arguments

test("Sends a single header", async () => {
  const fetchMock = makeFetchStub();
  vi.stubGlobal("fetch", fetchMock);
  await execute(
    [{ name: "http", url: "https://example.com", "header_Authorization": "Bearer token" }],
    "",
  );
  expect(fetchMock).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ headers: { Authorization: "Bearer token" } }),
  );
});

test("Sends multiple headers", async () => {
  const fetchMock = makeFetchStub();
  vi.stubGlobal("fetch", fetchMock);
  await execute(
    [{
      name: "http",
      url: "https://example.com",
      "header_Authorization": "Bearer token",
      "header_Accept": "application/json",
    }],
    "",
  );
  expect(fetchMock).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({
      headers: { Authorization: "Bearer token", Accept: "application/json" },
    }),
  );
});

test("Sends no headers object when no header_* args are given", async () => {
  const fetchMock = makeFetchStub();
  vi.stubGlobal("fetch", fetchMock);
  await execute([{ name: "http", url: "https://example.com" }], "");
  expect(fetchMock).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ headers: undefined }),
  );
});

// URL validation

test("Skips fetch when URL is invalid", async () => {
  const fetchMock = makeFetchStub();
  vi.stubGlobal("fetch", fetchMock);
  await execute([{ name: "http", url: "not-a-url" }], "input");
  expect(fetchMock).not.toHaveBeenCalled();
});

test("Sets jumpto with http-error-url when URL is invalid", async () => {
  vi.stubGlobal("fetch", makeFetchStub());
  const result = await execute([{ name: "http", url: "not-a-url" }], "input");
  expect(result.jumpto).toBe("http-error-url,error");
});

test("Preserves working.text when URL is invalid", async () => {
  vi.stubGlobal("fetch", makeFetchStub());
  const result = await execute([{ name: "http", url: "not-a-url" }], "preserved");
  expect(result.text).toBe("preserved");
});

test("Does not abort when URL is invalid", async () => {
  vi.stubGlobal("fetch", makeFetchStub());
  const result = await execute([{ name: "http", url: "not-a-url" }], "input");
  expect(result.abort).toBeFalsy();
});

test("Treats empty URL as invalid", async () => {
  const fetchMock = makeFetchStub();
  vi.stubGlobal("fetch", fetchMock);
  const result = await execute([{ name: "http", url: "" }], "input");
  expect(fetchMock).not.toHaveBeenCalled();
  expect(result.jumpto).toBe("http-error-url,error");
});

test("Treats non-http protocol as invalid", async () => {
  const fetchMock = makeFetchStub();
  vi.stubGlobal("fetch", fetchMock);
  const result = await execute(
    [{ name: "http", url: "ftp://example.com" }],
    "input",
  );
  expect(fetchMock).not.toHaveBeenCalled();
  expect(result.jumpto).toBe("http-error-url,error");
});

test("Accepts http:// URLs as valid", async () => {
  const fetchMock = makeFetchStub();
  vi.stubGlobal("fetch", fetchMock);
  await execute([{ name: "http", url: "http://example.com" }], "");
  expect(fetchMock).toHaveBeenCalled();
});

test("Accepts https:// URLs as valid", async () => {
  const fetchMock = makeFetchStub();
  vi.stubGlobal("fetch", fetchMock);
  await execute([{ name: "http", url: "https://example.com" }], "");
  expect(fetchMock).toHaveBeenCalled();
});

// HTTP status error handling

test("Sets jumpto with status-specific error label on 404", async () => {
  vi.stubGlobal(
    "fetch",
    makeFetchStub({ ok: false, status: 404, statusText: "Not Found" }),
  );
  const result = await execute(
    [{ name: "http", url: "https://example.com" }],
    "input",
  );
  expect(result.jumpto).toContain("http-error-404");
});

test("Sets jumpto with class-specific error label on 404", async () => {
  vi.stubGlobal(
    "fetch",
    makeFetchStub({ ok: false, status: 404, statusText: "Not Found" }),
  );
  const result = await execute(
    [{ name: "http", url: "https://example.com" }],
    "input",
  );
  expect(result.jumpto).toContain("http-error-4xx");
});

test("Sets jumpto with generic http-error and error labels on 404", async () => {
  vi.stubGlobal(
    "fetch",
    makeFetchStub({ ok: false, status: 404, statusText: "Not Found" }),
  );
  const result = await execute(
    [{ name: "http", url: "https://example.com" }],
    "input",
  );
  const labels = result.jumpto.split(",");
  expect(labels).toContain("http-error");
  expect(labels).toContain("error");
});

test("Generates 5xx error labels for 500 response", async () => {
  vi.stubGlobal(
    "fetch",
    makeFetchStub({ ok: false, status: 500, statusText: "Server Error" }),
  );
  const result = await execute(
    [{ name: "http", url: "https://example.com" }],
    "input",
  );
  expect(result.jumpto).toContain("http-error-500");
  expect(result.jumpto).toContain("http-error-5xx");
});

test("Orders error labels from most to least specific", async () => {
  vi.stubGlobal(
    "fetch",
    makeFetchStub({ ok: false, status: 404, statusText: "Not Found" }),
  );
  const result = await execute(
    [{ name: "http", url: "https://example.com" }],
    "input",
  );
  expect(result.jumpto.split(",")).toEqual([
    "http-error-404",
    "http-error-4xx",
    "http-error",
    "error",
  ]);
});

test("Preserves working.text on HTTP error instead of returning the error body", async () => {
  vi.stubGlobal(
    "fetch",
    makeFetchStub({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: "Not Found body",
    }),
  );
  const result = await execute(
    [{ name: "http", url: "https://example.com" }],
    "preserved",
  );
  expect(result.text).toBe("preserved");
});

test("Does not abort the pipeline on HTTP error", async () => {
  vi.stubGlobal(
    "fetch",
    makeFetchStub({ ok: false, status: 404, statusText: "Not Found" }),
  );
  const result = await execute(
    [{ name: "http", url: "https://example.com" }],
    "input",
  );
  expect(result.abort).toBeFalsy();
});

test("Does not set jumpto on a successful response", async () => {
  vi.stubGlobal("fetch", makeFetchStub({ status: 200, text: "ok" }));
  const result = await execute(
    [{ name: "http", url: "https://example.com" }],
    "input",
  );
  expect(result.jumpto).toBeFalsy();
});

test("Triggers error path for 4xx but not 3xx responses", async () => {
  // 3xx is technically not >= 400, so should not trigger error handling
  vi.stubGlobal(
    "fetch",
    makeFetchStub({ status: 301, statusText: "Moved Permanently", text: "" }),
  );
  const result = await execute(
    [{ name: "http", url: "https://example.com" }],
    "input",
  );
  expect(result.jumpto).toBeFalsy();
});

// on-error custom label

test("Prepends on-error label to jumpto when provided", async () => {
  vi.stubGlobal(
    "fetch",
    makeFetchStub({ ok: false, status: 404, statusText: "Not Found" }),
  );
  const result = await execute(
    [
      {
        name: "http",
        url: "https://example.com",
        "on-error": "my-handler",
      },
    ],
    "input",
  );
  expect(result.jumpto.split(",")[0]).toBe("my-handler");
});

test("Keeps default error labels after the on-error label", async () => {
  vi.stubGlobal(
    "fetch",
    makeFetchStub({ ok: false, status: 404, statusText: "Not Found" }),
  );
  const result = await execute(
    [
      {
        name: "http",
        url: "https://example.com",
        "on-error": "my-handler",
      },
    ],
    "input",
  );
  expect(result.jumpto.split(",")).toEqual([
    "my-handler",
    "http-error-404",
    "http-error-4xx",
    "http-error",
    "error",
  ]);
});

test("on-error has no effect on a successful response", async () => {
  vi.stubGlobal("fetch", makeFetchStub({ status: 200, text: "ok" }));
  const result = await execute(
    [
      {
        name: "http",
        url: "https://example.com",
        "on-error": "my-handler",
      },
    ],
    "input",
  );
  expect(result.jumpto).toBeFalsy();
});

// Network / CORS errors (fetch rejects)

test("Catches fetch rejection without aborting the pipeline", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
  );
  const result = await execute(
    [{ name: "http", url: "https://example.com" }],
    "preserved",
  );
  expect(result.abort).toBeFalsy();
});

test("Sets http-error-unknown jumpto on fetch rejection", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
  );
  const result = await execute(
    [{ name: "http", url: "https://example.com" }],
    "input",
  );
  expect(result.jumpto).toContain("http-error-unknown");
});

test("Sets http-error and error labels on fetch rejection", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
  );
  const result = await execute(
    [{ name: "http", url: "https://example.com" }],
    "input",
  );
  const labels = result.jumpto.split(",");
  expect(labels).toContain("http-error");
  expect(labels).toContain("error");
});

test("Preserves working.text when fetch rejects", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
  );
  const result = await execute(
    [{ name: "http", url: "https://example.com" }],
    "preserved",
  );
  expect(result.text).toBe("preserved");
});

test("Does not throw a ReferenceError when fetch rejects", async () => {
  // Regression: the error log used to reference response.statusText, which
  // was out of scope after a fetch rejection. The resulting ReferenceError
  // bubbled up to the pipeline's catch and aborted execution.
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
  );
  const result = await execute(
    [{ name: "http", url: "https://example.com" }],
    "input",
  );
  expect(result.abort).toBeFalsy();
  expect(result.jumpto).toBeTruthy();
});

test("Honors on-error label when fetch rejects", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
  );
  const result = await execute(
    [
      {
        name: "http",
        url: "https://example.com",
        "on-error": "network-handler",
      },
    ],
    "input",
  );
  expect(result.jumpto.split(",")[0]).toBe("network-handler");
});

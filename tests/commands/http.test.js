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
  expect(result.contentType).toBe("text/plain");
  expect(result.source).toBe("https://example.com");
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
  expect(result.contentType).toBe("text/html");
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

test("Returns empty working data on non-ok response", async () => {
  vi.stubGlobal(
    "fetch",
    makeFetchStub({ ok: false, status: 404, statusText: "Not Found" }),
  );
  const { Pipeline } = await import("../../src/textflow.js");
  const p = new Pipeline({
    commands: [
      {
        name: "http",
        arguments: [{ key: "url", value: "https://example.com/missing" }],
      },
    ],
  });
  const working = await p.execute({ history: [], text: "" });
  expect(working.source).toBeUndefined();
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

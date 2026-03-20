import { expect, test, vi } from "vitest";
import { execute } from "../helpers.js";

test("Appends a style block to HTML", async () => {
  let command = { name: "add-css", css: "body { color: red; }" };
  const result = await execute([command], "<p>Hello</p>");
  expect(result.text).toBe("<p>Hello</p>\n<style>body { color: red; }</style>");
});

test("Appends style block to existing HTML with multiple elements", async () => {
  let command = { name: "add-css", css: "h1 { font-size: 2em; }" };
  const result = await execute([command], "<h1>Title</h1><p>Body</p>");
  expect(result.text).toBe("<h1>Title</h1><p>Body</p>\n<style>h1 { font-size: 2em; }</style>");
});

test("Fetches CSS from a URL and appends it", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    text: async () => "body { color: red; }",
  }));

  const result = await execute([{ name: "add-css", url: "https://example.com/styles.css" }], "<p>Hello</p>");
  expect(result.text).toBe("<p>Hello</p>\n<style>body { color: red; }</style>");

  vi.unstubAllGlobals();
});

test("Aborts when neither css nor url is provided", async () => {
  let command = { name: "add-css" };
  await expect(execute([command], "<p>Hello</p>")).rejects.toThrow();
});

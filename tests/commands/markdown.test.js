import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Converts a heading to HTML", async () => {
  const result = await execute([{ name: "markdown" }], "# Hello");
  expect(result.text).toBe("<h1>Hello</h1>\n");
});

test("Converts bold text to HTML", async () => {
  const result = await execute([{ name: "markdown" }], "**bold**");
  expect(result.text).toBe("<p><strong>bold</strong></p>\n");
});

test("Converts a paragraph to HTML", async () => {
  const result = await execute([{ name: "markdown" }], "Hello world");
  expect(result.text).toBe("<p>Hello world</p>\n");
});

test("Converts an unordered list to HTML", async () => {
  const result = await execute([{ name: "markdown" }], "- one\n- two\n- three");
  expect(result.text).toBe("<ul>\n<li>one</li>\n<li>two</li>\n<li>three</li>\n</ul>\n");
});

test("Converts a link to HTML", async () => {
  const result = await execute([{ name: "markdown" }], "[click](https://example.com)");
  expect(result.text).toBe('<p><a href="https://example.com">click</a></p>\n');
});

test("Converts inline code to HTML", async () => {
  const result = await execute([{ name: "markdown" }], "`code`");
  expect(result.text).toBe("<p><code>code</code></p>\n");
});

test("Returns empty string for empty input", async () => {
  const result = await execute([{ name: "markdown" }], "");
  expect(result.text).toBe("");
});

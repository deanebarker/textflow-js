import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Wrap lines simple text", async () => {
  let command = { name: "wrap-lines" };
  const result = await execute([command], "foo\nbar");
  expect(result.text).toBe("<div>foo</div>\n<div>bar</div>");
});

test("Wrap lines with extra whitespace with trimming", async () => {
  let command = { name: "wrap-lines", trim: true };
  const result = await execute([command], "  foo  \n  bar  ");
  expect(result.text).toBe("<div>foo</div>\n<div>bar</div>");
});

test("Wrap lines with extra whitespace without trimming", async () => {
  let command = { name: "wrap-lines", trim: false };
  const result = await execute([command], "  foo  \n  bar  ");
  expect(result.text).toBe("<div>  foo  </div>\n<div>  bar  </div>");
});

test("Wrap lines with empty lines with removing empty lines", async () => {
  let command = { name: "wrap-lines", "remove-empty": true };
  const result = await execute([command], "foo\n\nbar");
  expect(result.text).toBe("<div>foo</div>\n<div>bar</div>");
});

test("Wrap lines with empty lines without removing empty lines", async () => {
  let command = { name: "wrap-lines", "remove-empty": false };
  const result = await execute([command], "foo\n\nbar");
  expect(result.text).toBe("<div>foo</div>\n<div></div>\n<div>bar</div>");
});

test("Wrap lines with custom tag", async () => {
  let command = { name: "wrap-lines", tag: "span" };
  const result = await execute([command], "foo\nbar");
  expect(result.text).toBe("<span>foo</span>\n<span>bar</span>");
});

test("Wrap lines with custom tag and class", async () => {
  let command = { name: "wrap-lines", tag: "span", class: "highlight" };
  const result = await execute([command], "foo\nbar");
  expect(result.text).toBe('<span class="highlight">foo</span>\n<span class="highlight">bar</span>');
});

import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Extracts a single element from HTML", async () => {
  const command = { name: "extract", selector: "p" };
  const result = await execute([command], "<p>a</p>");
  expect(result.text).toBe("<p>a</p>");
});

test("Ettempts to extract a single element from invalid HTML", async () => {
  const command = { name: "extract", selector: "p" };
  const result = await execute([command], "<p>a</p>");
  expect(result.text).toBe("<p>a</p>"); // JSDOM corrects invalid HTML
});

test("Ettempts to extract the innerHTML of a single element from invalid HTML", async () => {
  const command = { name: "extract", selector: "p", scope: "inner" };
  const result = await execute([command], "<p>a</p>");
  expect(result.text).toBe("a"); // JSDOM corrects invalid HTML
});

test("Extracts multiple elements from HTML", async () => {
  const command = { name: "extract", selector: "p" };
  const result = await execute([command], "<p>a</p><p>b</p>");
  expect(result.text).toBe("<p>a</p>\n<p>b</p>");
});

test("Extracts multiple elements from HTML with custom join", async () => {
  const command = { name: "extract", selector: "p", join: " | " };
  const result = await execute([command], "<p>a</p><p>b</p>");
  expect(result.text).toBe("<p>a</p> | <p>b</p>");
});

test("Extracts multiple elements from HTML with limit", async () => {
  const command = { name: "extract", selector: "p", limit: 1 };
  const result = await execute([command], "<p>a</p><p>b</p>");
  expect(result.text).toBe("<p>a</p>");
});

test("Extracts attribute value from HTML", async () => {
  const command = { name: "extract", selector: "p", scope: "@a" };
  const result = await execute([command], "<p a='1'>a</p><p b='2'>b</p>");
  expect(result.text).toBe("1");
});

test("Extracts text value from HTML", async () => {
  const command = { name: "extract", selector: "p", scope: "text" };
  const result = await execute([command], "<p>a<span>b</span></p>");
  expect(result.text).toBe("ab");
});

test("Extracts innerHtml value from HTML", async () => {
  const command = { name: "extract", selector: "p", scope: "inner" };
  const result = await execute([command], "<p>a<span>b</span></p>");
  expect(result.text).toBe("a<span>b</span>");
});
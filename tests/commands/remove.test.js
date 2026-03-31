import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Removes an element", async () => {
  const command = { name: "remove", selector:"p" };
  const result = await execute([command], "a<p>b</p>c");
  expect(result.text).toBe("ac");
});

test("Removes multiple elements", async () => {
  const command = { name: "remove", selector: "p" };
  const result = await execute([command], "a<p>b</p><p>c</p>d");
  expect(result.text).toBe("ad");
});

test("Removes elements with nested content", async () => {
  const command = { name: "remove", selector: "p" };
  const result = await execute([command], "a<p>b<span>c</span></p>d");
  expect(result.text).toBe("ad");
});

test("Removes elements with attributes", async () => {
  const command = { name: "remove", selector: "p" };
  const result = await execute([command], "a<p class='x'>b</p>c");
  expect(result.text).toBe("ac");
});

test("Doesn't remove anything with an invalid selector", async () => {
  const command = { name: "remove", selector: "invalid" };
  const result = await execute([command], "a<p>b</p>c");
  expect(result.text).toBe("a<p>b</p>c");
});

test("Doesn't remove anything with an empty selector", async () => {
  const command = { name: "remove", selector: "" };
  const result = await execute([command], "a<p>b</p>c");
  expect(result.text).toBe("a<p>b</p>c");
});

test("Doesn't remove anything with a null selector", async () => {
  const command = { name: "remove", selector: null };
  const result = await execute([command], "a<p>b</p>c");
  expect(result.text).toBe("a<p>b</p>c");
});

test("Doesn't remove anything with an undefined selector", async () => {
  const command = { name: "remove", selector: undefined };
  const result = await execute([command], "a<p>b</p>c");
  expect(result.text).toBe("a<p>b</p>c");
});

test("Preserves all inner content with preserve='all'", async () => {
  const command = { name: "remove", selector: "p", preserve: "all" };
  const result = await execute([command], "a<p>b<span>c</span></p>d");
  expect(result.text).toBe("ab<span>c</span>d");
});

test("Preserves only text content with preserve='text'", async () => {
  const command = { name: "remove", selector: "p", preserve: "text" };
  const result = await execute([command], "a<p>b<span>c</span></p>d");
  expect(result.text).toBe("abcd");
});

test("Preserves all content for multiple elements with preserve='all'", async () => {
  const command = { name: "remove", selector: "p", preserve: "all" };
  const result = await execute([command], "<p>a</p><p>b</p>");
  expect(result.text).toBe("ab");
});

test("Preserves text for multiple elements with preserve='text'", async () => {
  const command = { name: "remove", selector: "p", preserve: "text" };
  const result = await execute([command], "<p>a<span>b</span></p><p>c</p>");
  expect(result.text).toBe("abc");
});
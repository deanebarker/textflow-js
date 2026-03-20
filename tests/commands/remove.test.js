import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Removes an element", async () => {
  let command = { name: "remove", selector:"p" };
  const result = await execute([command], "a<p>b</p>c");
  expect(result.text).toBe("ac");
});

test("Removes multiple elements", async () => {
  let command = { name: "remove", selector: "p" };
  const result = await execute([command], "a<p>b</p><p>c</p>d");
  expect(result.text).toBe("ad");
});

test("Removes elements with nested content", async () => {
  let command = { name: "remove", selector: "p" };
  const result = await execute([command], "a<p>b<span>c</span></p>d");
  expect(result.text).toBe("ad");
});

test("Removes elements with attributes", async () => {
  let command = { name: "remove", selector: "p" };
  const result = await execute([command], "a<p class='x'>b</p>c");
  expect(result.text).toBe("ac");
});

test("Doesn't remove anything with an invalid selector", async () => {
  let command = { name: "remove", selector: "invalid" };
  const result = await execute([command], "a<p>b</p>c");
  expect(result.text).toBe("a<p>b</p>c");
});

test("Doesn't remove anything with an empty selector", async () => {
  let command = { name: "remove", selector: "" };
  const result = await execute([command], "a<p>b</p>c");
  expect(result.text).toBe("a<p>b</p>c");
});

test("Doesn't remove anything with a null selector", async () => {
  let command = { name: "remove", selector: null };
  const result = await execute([command], "a<p>b</p>c");
  expect(result.text).toBe("a<p>b</p>c");
});

test("Doesn't remove anything with an undefined selector", async () => {
  let command = { name: "remove", selector: undefined };
  const result = await execute([command], "a<p>b</p>c");
  expect(result.text).toBe("a<p>b</p>c");
});
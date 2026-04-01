import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Extracts a top-level field", async () => {
  const command = { name: "jsonata", expr: "name" };
  const result = await execute([command], '{"name": "Alice"}');
  expect(result.text).toBe('"Alice"');
});

test("Extracts a nested field", async () => {
  const command = { name: "jsonata", expr: "address.city" };
  const result = await execute([command], '{"address": {"city": "London"}}');
  expect(result.text).toBe('"London"');
});

test("Maps over an array", async () => {
  const command = { name: "jsonata", expr: "items.name" };
  const result = await execute([command], '{"items": [{"name": "a"}, {"name": "b"}]}');
  expect(result.text).toBe('["a","b"]');
});

test("Filters an array", async () => {
  const command = { name: "jsonata", expr: "items[active = true].name" };
  const result = await execute([command], '{"items": [{"name": "a", "active": true}, {"name": "b", "active": false}]}');
  expect(result.text).toBe('"a"');
});

test("Evaluates an arithmetic expression", async () => {
  const command = { name: "jsonata", expr: "price * qty" };
  const result = await execute([command], '{"price": 5, "qty": 3}');
  expect(result.text).toBe("15");
});

test("Returns valid JSON as text", async () => {
  const command = { name: "jsonata", expr: "val" };
  const result = await execute([command], '{"val": 1}');
  expect(JSON.parse(result.text)).toBe(1);
});

test("Aborts when expr argument is missing", async () => {
  await expect(execute([{ name: "jsonata" }], '{"x": 1}')).rejects.toThrow();
});

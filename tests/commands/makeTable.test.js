import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Produces a table element from JSON data", async () => {
  let command = { name: "make-table" };
  const result = await execute([command], '[{"name": "Alice", "age": 30}]');
  expect(result.text).toContain("<table");
});

test("Renders column headers from JSON keys", async () => {
  let command = { name: "make-table" };
  const result = await execute([command], '[{"name": "Alice", "age": 30}]');
  expect(result.text).toContain("<th");
  expect(result.text).toContain("name");
  expect(result.text).toContain("age");
});

test("Renders row data from JSON", async () => {
  let command = { name: "make-table" };
  const result = await execute([command], '[{"name": "Alice", "age": 30}]');
  expect(result.text).toContain("Alice");
  expect(result.text).toContain("30");
});

test("Applies custom column title via col_ argument", async () => {
  let command = { name: "make-table", col_name: "Full Name" };
  const result = await execute([command], '[{"name": "Alice"}]');
  expect(result.text).toContain("Full Name");
});

test("Adds numeric class to numeric columns", async () => {
  let command = { name: "make-table" };
  const result = await execute([command], '[{"score": 42}, {"score": 99}]');
  expect(result.text).toContain("numeric");
});

test("Produces a table from CSV data", async () => {
  let command = { name: "make-table" };
  const result = await execute([command], "name,age\nBob,25");
  expect(result.text).toContain("<table");
  expect(result.text).toContain("Bob");
});

test("Includes a style block in the output", async () => {
  let command = { name: "make-table" };
  const result = await execute([command], '[{"x": 1}]');
  expect(result.text).toContain("<style>");
});

test("Hides a column from display when specified in hide argument", async () => {
  let command = { name: "make-table", hide: "age" };
  const result = await execute([command], '[{"name": "Alice", "age": 30}]');
  expect(result.text).toContain("name");
  expect(result.text).not.toContain("age");
});

test("Hides multiple columns when comma-separated in hide argument", async () => {
  let command = { name: "make-table", hide: "age, score" };
  const result = await execute([command], '[{"name": "Alice", "age": 30, "score": 99}]');
  expect(result.text).toContain("name");
  expect(result.text).not.toContain("age");
  expect(result.text).not.toContain("score");
});

test("Hides columns matching hide-pattern regex", async () => {
  let command = { name: "make-table", "hide-pattern": "^_" };
  const result = await execute([command], '[{"name": "Alice", "_id": 1, "_rev": 2}]');
  expect(result.text).toContain("name");
  expect(result.text).not.toContain("_id");
  expect(result.text).not.toContain("_rev");
});

test("hide and hide-pattern can be used simultaneously", async () => {
  let command = { name: "make-table", hide: "age", "hide-pattern": "^_" };
  const result = await execute([command], '[{"name": "Alice", "age": 30, "_id": 1}]');
  expect(result.text).toContain("name");
  expect(result.text).not.toContain("age");
  expect(result.text).not.toContain("_id");
});

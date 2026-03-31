import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Converts simple CSV to JSON", async () => {
  const command = { name: "csv-to-json" };
  const result = await execute([command], "name\nAlice\nBob");
  const parsed = JSON.parse(result.text);
  expect(Array.isArray(parsed)).toBe(true);
  expect(parsed.length).toBe(2);
  expect(parsed[0].name).toBe("Alice");
  expect(parsed[1].name).toBe("Bob");
});

test("Handles multiple columns", async () => {
  const command = { name: "csv-to-json" };
  const result = await execute([command], "first name,last name\nJohn,Doe");
  const parsed = JSON.parse(result.text);
  expect(parsed[0].firstName).toBe("John");
  expect(parsed[0].lastName).toBe("Doe");
});

test("Converts hyphenated headers to camelCase", async () => {
  const command = { name: "csv-to-json" };
  const result = await execute([command], "product-name\nWidget");
  const parsed = JSON.parse(result.text);
  expect(parsed[0].productName).toBe("Widget");
});

test("Converts underscore headers to camelCase", async () => {
  const command = { name: "csv-to-json" };
  const result = await execute([command], "unit_price\n9.99");
  const parsed = JSON.parse(result.text);
  expect(parsed[0].unitPrice).toBe("9.99");
});

test("Skips empty rows", async () => {
  const command = { name: "csv-to-json" };
  const result = await execute([command], "name\nAlice\n\nBob");
  const parsed = JSON.parse(result.text);
  expect(parsed.length).toBe(2);
  expect(parsed[0].name).toBe("Alice");
  expect(parsed[1].name).toBe("Bob");
});

test("Handles quoted fields containing commas", async () => {
  const command = { name: "csv-to-json" };
  const result = await execute([command], 'city\n"London, UK"');
  const parsed = JSON.parse(result.text);
  expect(parsed[0].city).toBe("London, UK");
});

test("Returns valid JSON output", async () => {
  const command = { name: "csv-to-json" };
  const result = await execute([command], "val\n1");
  expect(() => JSON.parse(result.text)).not.toThrow();
});

test("Returns empty array for CSV with only a header row", async () => {
  const command = { name: "csv-to-json" };
  const result = await execute([command], "name");
  const parsed = JSON.parse(result.text);
  expect(Array.isArray(parsed)).toBe(true);
  expect(parsed.length).toBe(0);
})

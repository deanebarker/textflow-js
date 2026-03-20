import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Renders each row using a for loop", async () => {
  let command = { name: "template-csv", template: "{% for row in data %}<li>{{ row.name }}</li>{% endfor %}" };
  const result = await execute([command], "name\nAlice\nBob");
  expect(result.text).toBe("<li>Alice</li><li>Bob</li>");
});

test("Renders multiple columns per row", async () => {
  let command = { name: "template-csv", template: "{% for row in data %}{{ row.firstName }} {{ row.lastName }}{% endfor %}" };
  const result = await execute([command], "first name,last name\nJohn,Doe");
  expect(result.text).toBe("John Doe");
});

test("Converts hyphenated headers to camelCase", async () => {
  let command = { name: "template-csv", template: "{{ data[0].productName }}" };
  const result = await execute([command], "product-name\nWidget");
  expect(result.text).toBe("Widget");
});

test("Converts underscore headers to camelCase", async () => {
  let command = { name: "template-csv", template: "{{ data[0].unitPrice }}" };
  const result = await execute([command], "unit_price\n9.99");
  expect(result.text).toBe("9.99");
});

test("Skips empty rows", async () => {
  let command = { name: "template-csv", template: "{% for row in data %}<li>{{ row.name }}</li>{% endfor %}" };
  const result = await execute([command], "name\nAlice\n\nBob");
  expect(result.text).toBe("<li>Alice</li><li>Bob</li>");
});

test("Handles quoted fields containing commas", async () => {
  let command = { name: "template-csv", template: "{{ data[0].city }}" };
  const result = await execute([command], 'city\n"London, UK"');
  expect(result.text).toBe("London, UK");
});

test("Sets content type to text/html", async () => {
  let command = { name: "template-csv", template: "{{ data[0].val }}" };
  const result = await execute([command], "val\n1");
  expect(result.contentType).toBe("text/html");
});

test("Returns empty output for CSV with only a header row", async () => {
  let command = { name: "template-csv", template: "{% for row in data %}<li>{{ row.name }}</li>{% endfor %}" };
  const result = await execute([command], "name");
  expect(result.text).toBe("");
});

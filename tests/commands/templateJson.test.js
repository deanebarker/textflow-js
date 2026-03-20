import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Renders a simple template with JSON data", async () => {
  let command = { name: "template-json", template: "<p>{{ data.name }}</p>" };
  const result = await execute([command], '{"name": "Alice"}');
  expect(result.text).toBe("<p>Alice</p>");
});

test("Renders a template with multiple fields", async () => {
  let command = { name: "template-json", template: "<p>{{ data.first }} {{ data.last }}</p>" };
  const result = await execute([command], '{"first": "John", "last": "Doe"}');
  expect(result.text).toBe("<p>John Doe</p>");
});

test("Renders a template iterating over an array", async () => {
  let command = { name: "template-json", template: "{% for item in data %}<li>{{ item }}</li>{% endfor %}" };
  const result = await execute([command], '["a", "b", "c"]');
  expect(result.text).toBe("<li>a</li><li>b</li><li>c</li>");
});

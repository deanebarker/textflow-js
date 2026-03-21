import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Sets an attribute on an element", async () => {
  let command = { name: "set-attribute", selector: "img", attribute: "alt", value: "A photo" };
  const result = await execute([command], '<img src="photo.jpg">');
  expect(result.text).toBe('<img src="photo.jpg" alt="A photo">');
});

test("Replaces an existing attribute value", async () => {
  let command = { name: "set-attribute", selector: "a", attribute: "href", value: "https://new.com" };
  const result = await execute([command], '<a href="https://old.com">link</a>');
  expect(result.text).toBe('<a href="https://new.com">link</a>');
});

test("Sets a data attribute", async () => {
  let command = { name: "set-attribute", selector: "div", attribute: "data-id", value: "42" };
  const result = await execute([command], "<div>content</div>");
  expect(result.text).toBe('<div data-id="42">content</div>');
});

test("Modifies all matching elements by default", async () => {
  let command = { name: "set-attribute", selector: "p", attribute: "class", value: "highlight" };
  const result = await execute([command], "<p>first</p><p>second</p>");
  expect(result.text).toBe('<p class="highlight">first</p><p class="highlight">second</p>');
});

test("Modifies all matching elements when limit is 0", async () => {
  let command = { name: "set-attribute", selector: "p", attribute: "class", value: "highlight", limit: 0 };
  const result = await execute([command], "<p>a</p><p>b</p><p>c</p>");
  expect(result.text).toBe('<p class="highlight">a</p><p class="highlight">b</p><p class="highlight">c</p>');
});

test("Sets attribute on first N elements when limit is provided", async () => {
  let command = { name: "set-attribute", selector: "p", attribute: "class", value: "highlight", limit: 2 };
  const result = await execute([command], "<p>a</p><p>b</p><p>c</p>");
  expect(result.text).toBe('<p class="highlight">a</p><p class="highlight">b</p><p>c</p>');
});

test("Sets attribute on only the first element when limit is 1", async () => {
  let command = { name: "set-attribute", selector: "p", attribute: "class", value: "highlight", limit: 1 };
  const result = await execute([command], "<p>first</p><p>second</p>");
  expect(result.text).toBe('<p class="highlight">first</p><p>second</p>');
});

test("Does not change text when selector matches nothing", async () => {
  let command = { name: "set-attribute", selector: "span", attribute: "class", value: "x" };
  const result = await execute([command], "<p>hello</p>");
  expect(result.text).toBe("<p>hello</p>");
});

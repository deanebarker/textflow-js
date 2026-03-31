import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Add newlines to simple text", async () => {
  const command = { name: "new-lines" };
  const result = await execute([command], "foo\nbar");
  expect(result.text).toBe("foo<br>bar");
});

test("Add newlines to text with extra whitespace with trimming", async () => {
  const command = { name: "new-lines", trim: true };
  const result = await execute([command], "  foo  \n  bar  ");
  expect(result.text).toBe("foo<br>bar");
});

test("Add newlines to text with extra whitespace without trimming", async () => {
  const command = { name: "new-lines", trim: false };
  const result = await execute([command], "  foo  \n  bar  ");
  expect(result.text).toBe("  foo  <br>  bar  ");
});

test("Add newlines to text with empty lines with removing empty lines", async () => {
  const command = { name: "new-lines", "remove-empty": true };
  const result = await execute([command], "foo\n\nbar");
  expect(result.text).toBe("foo<br>bar");
});

test("Add newlines to text with empty lines without removing empty lines", async () => {
  const command = { name: "new-lines", "remove-empty": false };
  const result = await execute([command], "foo\n\nbar");
  expect(result.text).toBe("foo<br><br>bar");
});
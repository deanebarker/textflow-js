import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Removes one line from the top", async () => {
  const command = { name: "remove-lines", lines: 1 };
  const result = await execute([command], "a\nb\nc\nd");
  expect(glue(result.text)).toBe("bcd");
});

test("Removes multiple lines from the top", async () => {
  const command = { name: "remove-lines", lines: 2 };
  const result = await execute([command], "a\nb\nc\nd");
  expect(glue(result.text)).toBe("cd");
});

test("Removes one line from the end", async () => {
  const command = { name: "remove-lines", lines: 1, from: "end" };
  const result = await execute([command], "a\nb\nc\nd");
  expect(glue(result.text)).toBe("abc");
});

test("Removes multiple lines from the end", async () => {
  const command = { name: "remove-lines", lines: 2, from: "end" };
  const result = await execute([command], "a\nb\nc\nd");
  expect(glue(result.text)).toBe("ab");
});

test("Removes lines matching a regex", async () => {
  const command = { name: "remove-lines", regex: "^b" };
  const result = await execute([command], "a\nb\nbc\nd");
  expect(glue(result.text)).toBe("ad");
});

test("Removes all lines matching a regex", async () => {
  const command = { name: "remove-lines", regex: "\\d" };
  const result = await execute([command], "a\n1\nb\n2\nc");
  expect(glue(result.text)).toBe("abc");
});

function glue(lines) {
  return lines.split("\n").join("");
}
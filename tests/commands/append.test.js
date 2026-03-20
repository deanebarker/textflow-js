import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Appends text to existing content", async () => {
  let command = { name: "append", text: "bar" };
  const result = await execute([command], "foo");
  expect(result.text).toBe("foobar");
});

test("Appends empty text to existing content", async () => {
  let command = { name: "append", text: "" };
  const result = await execute([command], "foo");
  expect(result.text).toBe("foo");
});

test("Appends null to existing content", async () => {
  let command = { name: "append", text: null };
  const result = await execute([command], "foo");
  expect(result.text).toBe("foo");
});

test("Appends undefined to existing content", async () => {
  let command = { name: "append", text: undefined };
  const result = await execute([command], "foo");
  expect(result.text).toBe("foo");
});
import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Prepends text to existing content", async () => {
  const command = { name: "prepend", text: "bar" };
  const result = await execute([command], "foo");
  expect(result.text).toBe("barfoo");
});

test("Prepends empty text to existing content", async () => {
  const command = { name: "prepend", text: "" };
  const result = await execute([command], "foo");
  expect(result.text).toBe("foo");
});

test("Prepends null to existing content", async () => {
  const command = { name: "prepend", text: null };
  const result = await execute([command], "foo");
  expect(result.text).toBe("foo");
});

test("Prepends undefined to existing content", async () => {
  const command = { name: "prepend", text: undefined };
  const result = await execute([command], "foo");
  expect(result.text).toBe("foo");
});

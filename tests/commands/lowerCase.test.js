import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Converts text to lowercase", async () => {
  const command = { name: "lower-case" };
  const result = await execute([command], "HELLO WORLD");
  expect(result.text).toBe("hello world");
});

test("Converts mixed case to lowercase", async () => {
  const command = { name: "lower-case" };
  const result = await execute([command], "HeLLo WoRLd");
  expect(result.text).toBe("hello world");
});

test("Already lowercase text remains unchanged", async () => {
  const command = { name: "lower-case" };
  const result = await execute([command], "hello world");
  expect(result.text).toBe("hello world");
});

test("Empty string remains empty", async () => {
  const command = { name: "lower-case" };
  const result = await execute([command], "");
  expect(result.text).toBe("");
});

test("Text with numbers and special characters", async () => {
  const command = { name: "lower-case" };
  const result = await execute([command], "HELLO 123 !@#");
  expect(result.text).toBe("hello 123 !@#");
});

test("Can be chained with other commands", async () => {
  const commands = [
    { name: "lower-case" },
    { name: "append", text: "!" },
  ];
  const result = await execute(commands, "HELLO");
  expect(result.text).toBe("hello!");
});

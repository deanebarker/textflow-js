import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Capitalizes first letter of each word", async () => {
  const command = { name: "capitalize" };
  const result = await execute([command], "hello world");
  expect(result.text).toBe("Hello World");
});

test("Handles already capitalized text", async () => {
  const command = { name: "capitalize" };
  const result = await execute([command], "Hello World");
  expect(result.text).toBe("Hello World");
});

test("Lowercases the rest of each word", async () => {
  const command = { name: "capitalize" };
  const result = await execute([command], "hELLO wORLD");
  expect(result.text).toBe("Hello World");
});

test("Excludes specified words from capitalization", async () => {
  const command = { name: "capitalize", exclude: "the, and, of" };
  const result = await execute([command], "the king and queen of hearts");
  expect(result.text).toBe("the King and Queen of Hearts");
});

test("Exclude is case-insensitive", async () => {
  const command = { name: "capitalize", exclude: "THE, AND" };
  const result = await execute([command], "the king and queen");
  expect(result.text).toBe("the King and Queen");
});

test("Handles empty string", async () => {
  const command = { name: "capitalize" };
  const result = await execute([command], "");
  expect(result.text).toBe("");
});

test("Handles single word", async () => {
  const command = { name: "capitalize" };
  const result = await execute([command], "hello");
  expect(result.text).toBe("Hello");
});

test("Preserves punctuation", async () => {
  const command = { name: "capitalize" };
  const result = await execute([command], "hello, world! how are you?");
  expect(result.text).toBe("Hello, World! How Are You?");
});

test("Handles multiple spaces", async () => {
  const command = { name: "capitalize" };
  const result = await execute([command], "hello  world");
  expect(result.text).toBe("Hello  World");
});

test("Handles tabs and newlines", async () => {
  const command = { name: "capitalize" };
  const result = await execute([command], "hello\tworld\ntest");
  expect(result.text).toBe("Hello\tWorld\nTest");
});

test("Exclude with punctuation", async () => {
  const command = { name: "capitalize", exclude: "and" };
  const result = await execute([command], "hello and world");
  expect(result.text).toBe("Hello and World");
});

test("Empty exclude list", async () => {
  const command = { name: "capitalize", exclude: "" };
  const result = await execute([command], "hello world");
  expect(result.text).toBe("Hello World");
});

test("Exclude with extra spaces", async () => {
  const command = { name: "capitalize", exclude: "  the  ,  and  " };
  const result = await execute([command], "the quick and brown");
  expect(result.text).toBe("the Quick and Brown");
});

test("Can be chained with other commands", async () => {
  const commands = [
    { name: "capitalize" },
    { name: "append", text: "!" },
  ];
  const result = await execute(commands, "hello world");
  expect(result.text).toBe("Hello World!");
});

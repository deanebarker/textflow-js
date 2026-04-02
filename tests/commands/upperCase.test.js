import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Converts text to uppercase", async () => {
  const command = { name: "upper-case" };
  const result = await execute([command], "hello world");
  expect(result.text).toBe("HELLO WORLD");
});

test("Converts mixed case to uppercase", async () => {
  const command = { name: "upper-case" };
  const result = await execute([command], "HeLLo WoRLd");
  expect(result.text).toBe("HELLO WORLD");
});

test("Already uppercase text remains unchanged", async () => {
  const command = { name: "upper-case" };
  const result = await execute([command], "HELLO WORLD");
  expect(result.text).toBe("HELLO WORLD");
});

test("Empty string remains empty", async () => {
  const command = { name: "upper-case" };
  const result = await execute([command], "");
  expect(result.text).toBe("");
});

test("Text with numbers and special characters", async () => {
  const command = { name: "upper-case" };
  const result = await execute([command], "hello 123 !@#");
  expect(result.text).toBe("HELLO 123 !@#");
});

test("Can be chained with other commands", async () => {
  const commands = [
    { name: "upper-case" },
    { name: "append", text: "!" },
  ];
  const result = await execute(commands, "hello");
  expect(result.text).toBe("HELLO!");
});

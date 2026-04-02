import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Sets text to specified value", async () => {
  const command = { name: "set", text: "hello world" };
  const result = await execute([command], "previous content");
  expect(result.text).toBe("hello world");
});

test("Sets text to empty string by default", async () => {
  const command = { name: "set" };
  const result = await execute([command], "previous content");
  expect(result.text).toBe("");
});

test("Sets text to empty string when text argument is empty", async () => {
  const command = { name: "set", text: "" };
  const result = await execute([command], "previous content");
  expect(result.text).toBe("");
});

test("Sets text to null becomes empty string", async () => {
  const command = { name: "set", text: null };
  const result = await execute([command], "previous content");
  expect(result.text).toBe("");
});

test("Sets text to undefined becomes empty string", async () => {
  const command = { name: "set", text: undefined };
  const result = await execute([command], "previous content");
  expect(result.text).toBe("");
});

test("Set can be chained with other commands", async () => {
  const commands = [
    { name: "set", text: "initial" },
    { name: "append", text: " appended" },
  ];
  const result = await execute(commands, "ignored");
  expect(result.text).toBe("initial appended");
});

test("Set overwrites previous text completely", async () => {
  const commands = [
    { name: "append", text: "added" },
    { name: "set", text: "new" },
  ];
  const result = await execute(commands, "start");
  expect(result.text).toBe("new");
});

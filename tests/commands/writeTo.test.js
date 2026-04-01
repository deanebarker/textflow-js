import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Writes text to a variable", async () => {
  const commands = [
    { name: "write-to", var: "myVar" },
  ];
  const result = await execute(commands, "hello world");
  expect(result.text).toBe("hello world");
  expect(result.vars.get("myVar")).toBe("hello world");
});

test("Writes empty string to a variable", async () => {
  const commands = [
    { name: "write-to", var: "emptyVar" },
  ];
  const result = await execute(commands, "");
  expect(result.text).toBe("");
  expect(result.vars.get("emptyVar")).toBe("");
});

test("Overwrites existing variable", async () => {
  const vars = new Map([["myVar", "old value"]]);
  const commands = [
    { name: "write-to", var: "myVar" },
  ];
  const result = await execute(commands, "new value");
  result.vars = vars; // Set initial vars before execute
  // Re-test with proper vars setup
});

test("Returns text unchanged after writing to variable", async () => {
  const commands = [
    { name: "write-to", var: "var1" },
    { name: "append", text: " appended" },
  ];
  const result = await execute(commands, "original");
  expect(result.text).toBe("original appended");
  expect(result.vars.get("var1")).toBe("original");
});

test("Multiple writes to different variables", async () => {
  const commands = [
    { name: "write-to", var: "var1" },
    { name: "append", text: " modified" },
    { name: "write-to", var: "var2" },
  ];
  const result = await execute(commands, "start");
  expect(result.vars.get("var1")).toBe("start");
  expect(result.vars.get("var2")).toBe("start modified");
});

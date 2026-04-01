import { expect, test, describe } from "vitest";
import { execute } from "./helpers.js";

describe("Command target property", () => {
  test("Writes command result to vars when target is specified", async () => {
    const commands = [
      { name: "append", text: " World", target: "greeting" },
    ];
    const result = await execute(commands, "Hello");
    expect(result.text).toBe("Hello");
    expect(result.vars.get("greeting")).toBe("Hello World");
  });

  test("Writes command result to text when target is not specified", async () => {
    const commands = [
      { name: "append", text: " World" },
    ];
    const result = await execute(commands, "Hello");
    expect(result.text).toBe("Hello World");
  });

  test("Multiple commands with different targets", async () => {
    const commands = [
      { name: "append", text: " World", target: "var1" },
      { name: "prepend", text: "Hi ", target: "var2" },
    ];
    const result = await execute(commands, "Hello");
    expect(result.text).toBe("Hello");
    expect(result.vars.get("var1")).toBe("Hello World");
    expect(result.vars.get("var2")).toBe("Hi Hello");
  });

  test("Target can be overwritten by subsequent commands", async () => {
    const commands = [
      { name: "append", text: " World", target: "greeting" },
      { name: "append", text: "!!!", target: "greeting" },
    ];
    const result = await execute(commands, "Hello");
    expect(result.text).toBe("Hello");
    expect(result.vars.get("greeting")).toBe("Hello!!!");
  });

  test("Mix of targeted and non-targeted commands", async () => {
    const commands = [
      { name: "append", text: " World", target: "saved" },
      { name: "append", text: "!!!" },
    ];
    const result = await execute(commands, "Hello");
    expect(result.vars.get("saved")).toBe("Hello World");
    expect(result.text).toBe("Hello!!!");
  });

  test("Target with null result from command", async () => {
    const commands = [
      { name: "append", text: null, target: "nullVar" },
    ];
    const result = await execute(commands, "text");
    expect(result.text).toBe("text");
    expect(result.vars.get("nullVar")).toBe("text");
  });

  test("Working text remains unchanged when command has target", async () => {
    const commands = [
      { name: "append", text: " SAVED", target: "saved" },
      { name: "append", text: " MODIFIED" },
    ];
    const result = await execute(commands, "Original");
    expect(result.vars.get("saved")).toBe("Original SAVED");
    expect(result.text).toBe("Original MODIFIED");
  });

  test("Subsequent command operates on original text when previous had target", async () => {
    const commands = [
      { name: "append", text: " First", target: "step1" },
      { name: "append", text: " Second", target: "step2" },
      { name: "append", text: " Third" },
    ];
    const result = await execute(commands, "Start");
    expect(result.vars.get("step1")).toBe("Start First");
    expect(result.vars.get("step2")).toBe("Start Second");
    expect(result.text).toBe("Start Third");
  });

  test("Can read variable written via target with read-from", async () => {
    const commands = [
      { name: "append", text: " data", target: "myData" },
      { name: "read-from", var: "myData" },
    ];
    const result = await execute(commands, "initial");
    expect(result.vars.get("myData")).toBe("initial data");
    expect(result.text).toBe("initial data");
  });

  test("Target preserves original text through multiple operations", async () => {
    const commands = [
      { name: "prepend", text: "A ", target: "v1" },
      { name: "append", text: " Z", target: "v2" },
      { name: "prepend", text: "X ", target: "v3" },
    ];
    const result = await execute(commands, "middle");
    expect(result.text).toBe("middle");
    expect(result.vars.get("v1")).toBe("A middle");
    expect(result.vars.get("v2")).toBe("middle Z");
    expect(result.vars.get("v3")).toBe("X middle");
  });

  test("All vars remain distinct when using same base text", async () => {
    const commands = [
      { name: "append", text: "1", target: "variant1" },
      { name: "append", text: "2", target: "variant2" },
      { name: "append", text: "3", target: "variant3" },
    ];
    const result = await execute(commands, "base");
    expect(result.text).toBe("base");
    expect(result.vars.get("variant1")).toBe("base1");
    expect(result.vars.get("variant2")).toBe("base2");
    expect(result.vars.get("variant3")).toBe("base3");
  });
});

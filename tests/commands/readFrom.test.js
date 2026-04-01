import { expect, test, describe } from "vitest";
import { Pipeline, WorkingData } from "../../src/textflow.js";

// Helper to execute commands with initial vars
async function executeWithVars(commands, text, vars) {
  let working = new WorkingData(text);
  commands = commands.map((c) => convertCommand(c));
  const p = new Pipeline({ commands });
  p.vars = vars;
  working.vars = vars;
  p.debug = true;
  working = await p.execute(working);
  if (working.abort) {
    throw new Error("Pipeline execution aborted due to validation failure.");
  }
  return working;
}

function convertCommand(command) {
  try {
    return {
      name: command.name,
      arguments: Object.keys(command)
        .filter((k) => k !== "name")
        .map((k) => ({ key: k, value: command[k] })),
    };
  } catch (e) {
    console.error("Error converting command:", e);
    throw e;
  }
}

describe("readFrom command", () => {
  test("Reads a string variable", async () => {
    const vars = new Map([["greeting", "hello world"]]);
    const commands = [{ name: "read-from", var: "greeting" }];
    const result = await executeWithVars(commands, "", vars);
    expect(result.text).toBe("hello world");
  });

  test("Reads a number variable and converts to string", async () => {
    const vars = new Map([["count", 42]]);
    const commands = [{ name: "read-from", var: "count" }];
    const result = await executeWithVars(commands, "", vars);
    expect(result.text).toBe("42");
    expect(typeof result.text).toBe("string");
  });

  test("Reads a boolean variable and converts to string", async () => {
    const vars = new Map([["flag", true]]);
    const commands = [{ name: "read-from", var: "flag" }];
    const result = await executeWithVars(commands, "", vars);
    expect(result.text).toBe("true");
    expect(typeof result.text).toBe("string");
  });

  test("Reads an object variable and stringifies it", async () => {
    const obj = { name: "John", age: 30 };
    const vars = new Map([["person", obj]]);
    const commands = [{ name: "read-from", var: "person" }];
    const result = await executeWithVars(commands, "", vars);
    expect(result.text).toBe(JSON.stringify(obj));
    expect(typeof result.text).toBe("string");
  });

  test("Reads an array variable and stringifies it", async () => {
    const arr = [1, 2, 3];
    const vars = new Map([["numbers", arr]]);
    const commands = [{ name: "read-from", var: "numbers" }];
    const result = await executeWithVars(commands, "", vars);
    expect(result.text).toBe(JSON.stringify(arr));
  });

  test("Reads an undefined variable", async () => {
    const vars = new Map();
    const commands = [{ name: "read-from", var: "missing" }];
    const result = await executeWithVars(commands, "", vars);
    expect(result.text).toBe("undefined");
  });

  test("Reads a null variable", async () => {
    const vars = new Map([["nullVar", null]]);
    const commands = [{ name: "read-from", var: "nullVar" }];
    const result = await executeWithVars(commands, "", vars);
    expect(result.text).toBe("null");
  });

  test("Can chain read-from with other commands", async () => {
    const vars = new Map([["prefix", "Hello"]]);
    const commands = [
      { name: "read-from", var: "prefix" },
      { name: "append", text: " World" },
    ];
    const result = await executeWithVars(commands, "", vars);
    expect(result.text).toBe("Hello World");
  });

  test("Reads nested object and stringifies it properly", async () => {
    const nested = { user: { name: "Alice", address: { city: "NYC" } } };
    const vars = new Map([["data", nested]]);
    const commands = [{ name: "read-from", var: "data" }];
    const result = await executeWithVars(commands, "", vars);
    expect(result.text).toBe(JSON.stringify(nested));
    expect(JSON.parse(result.text)).toEqual(nested);
  });

  test("Reads zero as string", async () => {
    const vars = new Map([["zero", 0]]);
    const commands = [{ name: "read-from", var: "zero" }];
    const result = await executeWithVars(commands, "", vars);
    expect(result.text).toBe("0");
  });

  test("Reads empty string from variable", async () => {
    const vars = new Map([["empty", ""]]);
    const commands = [{ name: "read-from", var: "empty" }];
    const result = await executeWithVars(commands, "", vars);
    expect(result.text).toBe("");
  });
});

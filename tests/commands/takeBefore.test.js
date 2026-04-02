import { expect, test, describe } from "vitest";
import { execute } from "../helpers.js";

describe("takeBefore command", () => {
  test("takes text before first occurrence of character", async () => {
    const commands = [{ name: "take-before", char: "e" }];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe("D");
  });

  test("takes text before second occurrence of character", async () => {
    const commands = [{ name: "take-before", char: "e", index: 2 }];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe("Dean");
  });

  test("takes text before third occurrence of character", async () => {
    const commands = [{ name: "take-before", char: "a", index: 3 }];
    const result = await execute(commands, "banana");
    expect(result.text).toBe("banan");
  });

  test("returns empty string if character not found", async () => {
    const commands = [{ name: "take-before", char: "z" }];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe("");
  });

  test("returns empty string if index is higher than occurrence count", async () => {
    const commands = [{ name: "take-before", char: "e", index: 5 }];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe("");
  });

  test("works with single character string at target position", async () => {
    const commands = [{ name: "take-before", char: "a" }];
    const result = await execute(commands, "a");
    expect(result.text).toBe("");
  });

  test("works with space character", async () => {
    const commands = [{ name: "take-before", char: " " }];
    const result = await execute(commands, "Hello World");
    expect(result.text).toBe("Hello");
  });

  test("works with special characters", async () => {
    const commands = [{ name: "take-before", char: "." }];
    const result = await execute(commands, "example.com");
    expect(result.text).toBe("example");
  });

  test("index defaults to 1", async () => {
    const commands = [{ name: "take-before", char: "o" }];
    const result = await execute(commands, "foo");
    expect(result.text).toBe("f");
  });

  test("requires char argument", async () => {
    const commands = [{ name: "take-before" }];
    expect(async () => {
      await execute(commands, "test");
    }).rejects.toThrow();
  });

  test("takes text before character near end", async () => {
    const commands = [{ name: "take-before", char: "k" }];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe("Deane Bar");
  });

  test("inclusive:true includes the character", async () => {
    const commands = [{ name: "take-before", char: "e", inclusive: true }];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe("De");
  });

  test("inclusive:true includes second occurrence with character", async () => {
    const commands = [
      { name: "take-before", char: "e", index: 2, inclusive: true },
    ];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe("Deane");
  });

  test("inclusive:false excludes the character (default)", async () => {
    const commands = [{ name: "take-before", char: "e", inclusive: false }];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe("D");
  });

  test("inclusive:true works when character is at start", async () => {
    const commands = [{ name: "take-before", char: "D", inclusive: true }];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe("D");
  });
});

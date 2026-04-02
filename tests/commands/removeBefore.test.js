import { expect, test, describe } from "vitest";
import { execute } from "../helpers.js";

describe("removeBefore command", () => {
  test("removes text before first occurrence of character", async () => {
    const commands = [{ name: "remove-before", char: "e" }];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe("eane Barker");
  });

  test("removes text before second occurrence of character", async () => {
    const commands = [{ name: "remove-before", char: "e", index: 2 }];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe("e Barker");
  });

  test("removes text before third occurrence of character", async () => {
    const commands = [{ name: "remove-before", char: "a", index: 3 }];
    const result = await execute(commands, "banana");
    expect(result.text).toBe("a");
  });

  test("returns original text if character not found", async () => {
    const commands = [{ name: "remove-before", char: "z" }];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe("Deane Barker");
  });

  test("returns original text if index is higher than occurrence count", async () => {
    const commands = [{ name: "remove-before", char: "e", index: 5 }];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe("Deane Barker");
  });

  test("works with single character string", async () => {
    const commands = [{ name: "remove-before", char: "a" }];
    const result = await execute(commands, "a");
    expect(result.text).toBe("a");
  });

  test("works with space character", async () => {
    const commands = [{ name: "remove-before", char: " " }];
    const result = await execute(commands, "Hello World");
    expect(result.text).toBe(" World");
  });

  test("works with special characters", async () => {
    const commands = [{ name: "remove-before", char: "." }];
    const result = await execute(commands, "example.com");
    expect(result.text).toBe(".com");
  });

  test("index defaults to 1", async () => {
    const commands = [{ name: "remove-before", char: "o" }];
    const result = await execute(commands, "foo");
    expect(result.text).toBe("oo");
  });

  test("requires char argument", async () => {
    const commands = [{ name: "remove-before" }];
    expect(async () => {
      await execute(commands, "test");
    }).rejects.toThrow();
  });

  test("inclusive:true also removes the character", async () => {
    const commands = [{ name: "remove-before", char: "e", inclusive: true }];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe("ane Barker");
  });

  test("inclusive:false keeps the character (default)", async () => {
    const commands = [{ name: "remove-before", char: "e", inclusive: false }];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe("eane Barker");
  });

  test("inclusive:true with second occurrence removes the character", async () => {
    const commands = [
      { name: "remove-before", char: "e", index: 2, inclusive: true },
    ];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe(" Barker");
  });

  test("inclusive:false with second occurrence keeps the character", async () => {
    const commands = [
      { name: "remove-before", char: "e", index: 2, inclusive: false },
    ];
    const result = await execute(commands, "Deane Barker");
    expect(result.text).toBe("e Barker");
  });

  test("default behavior (inclusive:false) keeps the character", async () => {
    const commands = [{ name: "remove-before", char: "a" }];
    const result = await execute(commands, "banana");
    expect(result.text).toBe("anana");
  });
});

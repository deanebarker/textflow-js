import { expect, test, describe } from "vitest";
import { execute } from "../helpers.js";

describe("trim command", () => {
  test("trims whitespace from both sides (default)", async () => {
    const commands = [{ name: "trim" }];
    const result = await execute(commands, "  hello world  ");
    expect(result.text).toBe("hello world");
  });

  test("trims whitespace from start only", async () => {
    const commands = [{ name: "trim", scope: "start" }];
    const result = await execute(commands, "  hello world  ");
    expect(result.text).toBe("hello world  ");
  });

  test("trims whitespace from end only", async () => {
    const commands = [{ name: "trim", scope: "end" }];
    const result = await execute(commands, "  hello world  ");
    expect(result.text).toBe("  hello world");
  });

  test("trims whitespace from both sides explicitly", async () => {
    const commands = [{ name: "trim", scope: "both" }];
    const result = await execute(commands, "  hello world  ");
    expect(result.text).toBe("hello world");
  });

  test("trims specific character from both sides", async () => {
    const commands = [{ name: "trim", char: "*" }];
    const result = await execute(commands, "***hello world***");
    expect(result.text).toBe("hello world");
  });

  test("trims specific character from start only", async () => {
    const commands = [{ name: "trim", char: "*", scope: "start" }];
    const result = await execute(commands, "***hello world***");
    expect(result.text).toBe("hello world***");
  });

  test("trims specific character from end only", async () => {
    const commands = [{ name: "trim", char: "*", scope: "end" }];
    const result = await execute(commands, "***hello world***");
    expect(result.text).toBe("***hello world");
  });

  test("trims tabs and newlines", async () => {
    const commands = [{ name: "trim" }];
    const result = await execute(commands, "\t\nhello world\n\t");
    expect(result.text).toBe("hello world");
  });

  test("handles string with no trimming needed", async () => {
    const commands = [{ name: "trim" }];
    const result = await execute(commands, "hello world");
    expect(result.text).toBe("hello world");
  });

  test("doesn't trim character that appears in the middle", async () => {
    const commands = [{ name: "trim", char: "*" }];
    const result = await execute(commands, "**hello*world**");
    expect(result.text).toBe("hello*world");
  });

  test("trims single character string", async () => {
    const commands = [{ name: "trim", char: "a" }];
    const result = await execute(commands, "aaa");
    expect(result.text).toBe("");
  });

  test("returns empty string if all characters are trimmed", async () => {
    const commands = [{ name: "trim" }];
    const result = await execute(commands, "     ");
    expect(result.text).toBe("");
  });

  test("trims only from start with whitespace", async () => {
    const commands = [{ name: "trim", scope: "start" }];
    const result = await execute(commands, "  \n\t  test");
    expect(result.text).toBe("test");
  });

  test("trims multiple occurrences of specific character", async () => {
    const commands = [{ name: "trim", char: "x" }];
    const result = await execute(commands, "xxxhello worldxxx");
    expect(result.text).toBe("hello world");
  });

  test("scope defaults to both", async () => {
    const commands = [{ name: "trim", char: "-" }];
    const result = await execute(commands, "---test---");
    expect(result.text).toBe("test");
  });

  test("trims space character specifically", async () => {
    const commands = [{ name: "trim", char: " " }];
    const result = await execute(commands, "   hello world   ");
    expect(result.text).toBe("hello world");
  });
});

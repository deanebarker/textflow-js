import { expect, test, describe } from "vitest";
import { Pipeline, WorkingData } from "../../src/textflow.js";

function cmd(name, args = {}) {
  return {
    name,
    arguments: Object.entries(args).map(([key, value]) => ({ key, value })),
  };
}

async function run(commands, text = "") {
  const p = new Pipeline({ commands });
  return await p.execute(new WorkingData(text));
}

// ==============================================================================
// jump-to command
// ==============================================================================

describe("jump-to command", () => {
  test("is registered in the static command library", () => {
    const p = new Pipeline({ commands: [] });
    expect(p.getCommandFunction("jump-to")).toBeTypeOf("function");
  });

  test("does not modify working.text", async () => {
    const result = await run(
      [
        cmd("jump-to", { label: "end" }),
        cmd("label", { name: "end" }),
      ],
      "untouched",
    );
    expect(result.text).toBe("untouched");
  });

  test("aborts when label argument is missing", async () => {
    const result = await run([cmd("jump-to")], "x");
    expect(result.abort).toBe(true);
  });

  test("validateCommand reports an error when label is missing", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(cmd("jump-to"));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/label/i);
  });

  test("validateCommand passes when label is present", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(cmd("jump-to", { label: "anywhere" }));
    expect(errors).toEqual([]);
  });
});

// ==============================================================================
// label command (the jump target)
// ==============================================================================

describe("label command", () => {
  test("is registered in the static command library", () => {
    const p = new Pipeline({ commands: [] });
    expect(p.getCommandFunction("label")).toBeTypeOf("function");
  });

  test("does not modify working.text", async () => {
    const result = await run([cmd("label", { name: "foo" })], "preserve me");
    expect(result.text).toBe("preserve me");
  });
});

// ==============================================================================
// Pipeline jump-to behavior (queue manipulation)
// ==============================================================================

describe("Pipeline jump-to behavior", () => {
  test("skips commands between jump-to and the matching label", async () => {
    const result = await run(
      [
        cmd("set", { text: "start" }),
        cmd("jump-to", { label: "target" }),
        cmd("append", { text: " skipped-1" }),
        cmd("append", { text: " skipped-2" }),
        cmd("label", { name: "target" }),
        cmd("append", { text: " after" }),
      ],
      "",
    );
    expect(result.text).toBe("start after");
  });

  test("commands after the matched label run normally", async () => {
    const result = await run(
      [
        cmd("set", { text: "x" }),
        cmd("jump-to", { label: "L" }),
        cmd("append", { text: " skip" }),
        cmd("label", { name: "L" }),
        cmd("append", { text: " A" }),
        cmd("append", { text: " B" }),
      ],
      "",
    );
    expect(result.text).toBe("x A B");
  });

  test("matches only the label with the requested name", async () => {
    const result = await run(
      [
        cmd("set", { text: "x" }),
        cmd("jump-to", { label: "second" }),
        cmd("label", { name: "first" }),
        cmd("append", { text: " not-this" }),
        cmd("label", { name: "second" }),
        cmd("append", { text: " here" }),
      ],
      "",
    );
    expect(result.text).toBe("x here");
  });

  test("ignores jump-to when no label exists at all", async () => {
    const result = await run(
      [
        cmd("set", { text: "x" }),
        cmd("jump-to", { label: "missing" }),
        cmd("append", { text: " continues" }),
      ],
      "",
    );
    expect(result.text).toBe("x continues");
  });

  test("ignores jump-to when no label matches the target name", async () => {
    const result = await run(
      [
        cmd("set", { text: "x" }),
        cmd("jump-to", { label: "missing" }),
        cmd("label", { name: "different" }),
        cmd("append", { text: " ran" }),
      ],
      "",
    );
    expect(result.text).toBe("x ran");
  });

  test("does not abort when the label is missing", async () => {
    const result = await run(
      [
        cmd("jump-to", { label: "missing" }),
        cmd("set", { text: "completed" }),
      ],
      "",
    );
    expect(result.abort).toBeFalsy();
    expect(result.text).toBe("completed");
  });

  test("supports multiple jump-tos in sequence", async () => {
    const result = await run(
      [
        cmd("set", { text: "x" }),
        cmd("jump-to", { label: "first" }),
        cmd("append", { text: " skip-1" }),
        cmd("label", { name: "first" }),
        cmd("append", { text: " A" }),
        cmd("jump-to", { label: "second" }),
        cmd("append", { text: " skip-2" }),
        cmd("label", { name: "second" }),
        cmd("append", { text: " B" }),
      ],
      "",
    );
    expect(result.text).toBe("x A B");
  });

  test("clears jumpto after a successful jump", async () => {
    const result = await run(
      [
        cmd("jump-to", { label: "L" }),
        cmd("label", { name: "L" }),
        cmd("set", { text: "ok" }),
      ],
      "",
    );
    expect(result.text).toBe("ok");
  });

  test("clears jumpto after a failed jump so subsequent jumps still work", async () => {
    const result = await run(
      [
        cmd("jump-to", { label: "missing" }),
        cmd("set", { text: "first" }),
        cmd("jump-to", { label: "L" }),
        cmd("append", { text: " skipped" }),
        cmd("label", { name: "L" }),
        cmd("append", { text: " end" }),
      ],
      "",
    );
    expect(result.text).toBe("first end");
  });

  test("only jumps forward — labels before jump-to are not reachable", async () => {
    const result = await run(
      [
        cmd("label", { name: "before" }),
        cmd("set", { text: "x" }),
        cmd("jump-to", { label: "before" }),
        cmd("append", { text: " end" }),
      ],
      "",
    );
    expect(result.text).toBe("x end");
  });

  test("the matched label itself runs (it is the landing point, not skipped)", async () => {
    const p = new Pipeline({
      commands: [
        cmd("jump-to", { label: "here" }),
        cmd("append", { text: " skipped" }),
        cmd("label", { name: "here" }),
      ],
    });
    const working = await p.execute(new WorkingData("x"));
    const ranNames = working.history.map((h) => h.command.name);
    expect(ranNames).toContain("label");
    expect(ranNames).not.toContain("append");
  });

  test("history records only the commands that actually ran", async () => {
    const p = new Pipeline({
      commands: [
        cmd("jump-to", { label: "L" }),
        cmd("append", { text: " A" }),
        cmd("append", { text: " B" }),
        cmd("label", { name: "L" }),
        cmd("append", { text: " end" }),
      ],
    });
    const working = await p.execute(new WorkingData("x"));
    const ranNames = working.history.map((h) => h.command.name);
    expect(ranNames).toEqual(["jump-to", "label", "append"]);
  });

  test("jump target resolves against tail commands too", async () => {
    const p = new Pipeline({
      commands: [
        cmd("jump-to", { label: "tail-target" }),
        cmd("append", { text: " skipped" }),
      ],
    });
    p.tailCommands = [
      cmd("label", { name: "tail-target" }),
      cmd("append", { text: " from-tail" }),
    ];
    const working = await p.execute(new WorkingData("x"));
    expect(working.text).toBe("x from-tail");
  });
});

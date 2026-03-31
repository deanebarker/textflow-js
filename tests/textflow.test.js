import { expect, test, describe } from "vitest";
import { Pipeline, executePipeline, validateCommands } from "../src/textflow.js";
import { detectMimeType } from "../src/helpers.js";

// Helper to build a command in the raw format Pipeline expects
function cmd(name, args = {}) {
  return {
    name,
    arguments: Object.entries(args).map(([key, value]) => ({ key, value })),
  };
}

// Helper to build a Pipeline with instance commands so we control return values
function makePipeline(commands, instanceCommands = {}) {
  const p = new Pipeline({ commands });
  for (const [name, fn] of Object.entries(instanceCommands)) {
    p.instanceCommandLib.set(name, fn);
  }
  return p;
}

//==============================================================================
// Pipeline constructor
//==============================================================================

describe("Pipeline constructor", () => {
  test("removes set-debug command from the command list", () => {
    const p = new Pipeline({ commands: [cmd("set-debug"), cmd("append")] });
    expect(p.commands.every((c) => c.name !== "set-debug")).toBe(true);
  });

  test("sets debug=true when set-debug is present", () => {
    const p = new Pipeline({ commands: [cmd("set-debug"), cmd("append")] });
    expect(p.debug).toBe(true);
  });

  test("leaves debug=false when set-debug is absent", () => {
    const p = new Pipeline({ commands: [cmd("append")] });
    expect(p.debug).toBe(false);
  });

  test("keeps non-debug commands intact", () => {
    const p = new Pipeline({ commands: [cmd("append"), cmd("prepend")] });
    expect(p.commands.map((c) => c.name)).toEqual(["append", "prepend"]);
  });
});

//==============================================================================
// getCommandFunction
//==============================================================================

describe("getCommandFunction", () => {
  test("returns null for an unknown command", () => {
    const p = makePipeline([]);
    expect(p.getCommandFunction("does-not-exist")).toBeNull();
  });

  test("returns the function for a known static command", () => {
    const p = makePipeline([]);
    expect(p.getCommandFunction("append")).toBeTypeOf("function");
  });

  test("instance command takes priority over static command", () => {
    const custom = () => "custom";
    const p = makePipeline([], { append: custom });
    expect(p.getCommandFunction("append")).toBe(custom);
  });
});

//==============================================================================
// validate
//==============================================================================

describe("validate", () => {
  test("returns no errors for a valid pipeline", () => {
    const p = new Pipeline({ commands: [cmd("append", { text: "hi" })] });
    expect(p.validate()).toEqual([]);
  });

  test("returns an error for an unknown command", () => {
    const p = new Pipeline({ commands: [cmd("nonexistent")] });
    const errors = p.validate();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/unknown command/i);
  });

  test("returns an error when a required arg is missing", () => {
    // http requires a url argument
    const p = new Pipeline({ commands: [cmd("http")] });
    const errors = p.validate();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/url/i);
  });

  test("returns no error when required arg is present", () => {
    const p = new Pipeline({ commands: [cmd("http", { url: "https://example.com" })] });
    expect(p.validate()).toEqual([]);
  });
});

//==============================================================================
// validateCommands (top-level function)
//==============================================================================

describe("validateCommands", () => {
  test("returns errors via the top-level function", () => {
    const errors = validateCommands({ commands: [cmd("nonexistent")] });
    expect(errors.length).toBeGreaterThan(0);
  });

  test("returns no errors for a valid command set", () => {
    const errors = validateCommands({ commands: [cmd("append", { text: "x" })] });
    expect(errors).toEqual([]);
  });
});

//==============================================================================
// wrapCommand — hasArg / getArg
//==============================================================================

describe("wrapCommand", () => {
  test("hasArg returns true for a present argument", () => {
    const p = makePipeline([]);
    const command = cmd("test", { foo: "bar" });
    p.wrapCommand(command, p);
    expect(command.hasArg("foo")).toBe(true);
  });

  test("hasArg returns false for a missing argument", () => {
    const p = makePipeline([]);
    const command = cmd("test", { foo: "bar" });
    p.wrapCommand(command, p);
    expect(command.hasArg("missing")).toBe(false);
  });

  test("hasArg accepts comma-separated aliases", () => {
    const p = makePipeline([]);
    const command = cmd("test", { bar: "value" });
    p.wrapCommand(command, p);
    expect(command.hasArg("foo, bar")).toBe(true);
  });

  test("getArg returns the value for a present argument", () => {
    const p = makePipeline([]);
    const command = cmd("test", { foo: "hello" });
    p.wrapCommand(command, p);
    expect(command.getArg("foo")).toBe("hello");
  });

  test("getArg returns null for a missing argument", () => {
    const p = makePipeline([]);
    const command = cmd("test");
    p.wrapCommand(command, p);
    expect(command.getArg("missing")).toBeNull();
  });

  test("getArg tries comma-separated aliases in order", () => {
    const p = makePipeline([]);
    const command = cmd("test", { second: "value" });
    p.wrapCommand(command, p);
    expect(command.getArg("first, second")).toBe("value");
  });

  test("getArg resolves a {variable} reference from pipeline vars", () => {
    const p = makePipeline([]);
    p.vars.set("myVar", "resolved!");
    const command = cmd("test", { foo: "{myVar}" });
    p.wrapCommand(command, p);
    expect(command.getArg("foo")).toBe("resolved!");
  });

  test("getArg returns null when variable reference is not in vars", () => {
    const p = makePipeline([]);
    const command = cmd("test", { foo: "{missing}" });
    p.wrapCommand(command, p);
    expect(command.getArg("foo")).toBeNull();
  });
});

//==============================================================================
// processCommandResult
//==============================================================================

describe("processCommandResult via execute", () => {
  test("string return value replaces working.text", async () => {
    const fn = async () => "replaced";
    fn.parseValidators = [];
    const p = makePipeline([cmd("test-cmd")], { "test-cmd": fn });
    const working = await p.execute({ history: [], text: "original" });
    expect(working.text).toBe("replaced");
  });

  test("plain object return merges text and contentType", async () => {
    const fn = async () => ({ text: "merged", contentType: "text/html" });
    fn.parseValidators = [];
    const p = makePipeline([cmd("test-cmd")], { "test-cmd": fn });
    const working = await p.execute({ history: [], text: "" });
    expect(working.text).toBe("merged");
    expect(working.contentType).toBe("text/html");
  });

  test("plain object return merges container shallowly into a WorkingData", async () => {
    // Container merging only happens when working is a WorkingData instance (not a
    // plain object). Use executePipeline to get a real WorkingData, then run two
    // commands that each return a different container key.
    const fn1 = async () => ({ container: { height: 50 } });
    fn1.parseValidators = [];
    Pipeline.staticCommandLib.set("__test-container-a", fn1);

    const fn2 = async () => ({ container: { width: 100 } });
    fn2.parseValidators = [];
    Pipeline.staticCommandLib.set("__test-container-b", fn2);

    try {
      const result = await executePipeline("", null, null, {
        commands: [cmd("__test-container-a"), cmd("__test-container-b")],
      }, null);
      expect(result.container.height).toBe(50);
      expect(result.container.width).toBe(100);
    } finally {
      Pipeline.staticCommandLib.delete("__test-container-a");
      Pipeline.staticCommandLib.delete("__test-container-b");
    }
  });

  test("plain object return sets source", async () => {
    const fn = async () => ({ text: "x", source: "https://example.com" });
    fn.parseValidators = [];
    const p = makePipeline([cmd("test-cmd")], { "test-cmd": fn });
    const working = await p.execute({ history: [], text: "" });
    expect(working.source).toBe("https://example.com");
  });
});

//==============================================================================
// execute — flow control
//==============================================================================

describe("execute flow control", () => {
  test("unknown commands are skipped without aborting", async () => {
    const p = new Pipeline({ commands: [cmd("totally-unknown"), cmd("append", { text: "!" })] });
    const working = await p.execute({ history: [], text: "hi" });
    expect(working.text).toBe("hi!");
  });

  test("head commands run before main commands", async () => {
    const order = [];
    const headFn = async () => { order.push("head"); return ""; };
    headFn.parseValidators = [];
    const mainFn = async () => { order.push("main"); return ""; };
    mainFn.parseValidators = [];

    const p = makePipeline([cmd("main-cmd")], { "head-cmd": headFn, "main-cmd": mainFn });
    p.headCommands = [cmd("head-cmd")];
    await p.execute({ history: [], text: "" });
    expect(order).toEqual(["head", "main"]);
  });

  test("tail commands run after main commands", async () => {
    const order = [];
    const mainFn = async () => { order.push("main"); return ""; };
    mainFn.parseValidators = [];
    const tailFn = async () => { order.push("tail"); return ""; };
    tailFn.parseValidators = [];

    const p = makePipeline([cmd("main-cmd")], { "main-cmd": mainFn, "tail-cmd": tailFn });
    p.tailCommands = [cmd("tail-cmd")];
    await p.execute({ history: [], text: "" });
    expect(order).toEqual(["main", "tail"]);
  });

  test("tail commands are cleared after execution", async () => {
    const fn = async () => "";
    fn.parseValidators = [];
    const p = makePipeline([], { "tail-cmd": fn });
    p.tailCommands = [cmd("tail-cmd")];
    await p.execute({ history: [], text: "" });
    expect(p.tailCommands).toHaveLength(0);
  });

  test("command exception causes abort and returns empty working data", async () => {
    const fn = async () => { throw new Error("boom"); };
    fn.parseValidators = [];
    const p = makePipeline([cmd("bad-cmd")], { "bad-cmd": fn });
    const working = await p.execute({ history: [], text: "original" });
    expect(working.text).toBeUndefined();
  });

  test("history is populated after execution", async () => {
    const p = new Pipeline({ commands: [cmd("append", { text: "!" })] });
    const working = await p.execute({ history: [], text: "hi" });
    expect(working.history.length).toBe(1);
    expect(working.history[0].command.name).toBe("append");
  });
});

//==============================================================================
// executePipeline (top-level function)
//==============================================================================

describe("executePipeline", () => {
  test("executes a pipeline and returns working data", async () => {
    const result = await executePipeline(
      "hello",
      "text/plain",
      null,
      { commands: [cmd("append", { text: " world" })] },
      null
    );
    expect(result.text).toBe("hello world");
  });

  test("passes initial contentType through", async () => {
    const result = await executePipeline("x", "text/html", null, { commands: [] }, null);
    expect(result.contentType).toBe("text/html");
  });

  test("accepts a vars map for variable resolution", async () => {
    const vars = new Map([["greeting", "hello world"]]);
    const result = await executePipeline(
      "",
      null,
      null,
      { commands: [cmd("append", { text: "{greeting}" })] },
      vars
    );
    expect(result.text).toBe("hello world");
  });
});

//==============================================================================
// validateCommand
//==============================================================================

describe("validateCommand", () => {
  test("returns no errors for a valid command", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(cmd("append", { text: "hi" }));
    expect(errors).toEqual([]);
  });

  test("returns an error for an unknown command", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(cmd("nonexistent"));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/unknown command/i);
  });

  test("returns an error when a required arg is missing", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(cmd("remove")); // selector is required
    expect(errors.length).toBeGreaterThan(0);
  });

  test("returns no error when required arg is present", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(cmd("remove", { selector: "p" }));
    expect(errors).toEqual([]);
  });

  test("returns an error when an arg value is not in allowedValues", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(cmd("remove", { selector: "p", preserve: "invalid" }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/preserve/i);
  });

  test("returns no error when an arg value is in allowedValues", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(cmd("remove", { selector: "p", preserve: "all" }));
    expect(errors).toEqual([]);
  });

  test("returns no error when an optional arg with allowedValues is omitted", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(cmd("remove", { selector: "p" }));
    expect(errors).toEqual([]);
  });

  test("returns an error when a number arg receives a non-numeric value", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(cmd("remove-lines", { lines: "abc" }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/not a valid number/i);
  });

  test("returns no error when a number arg receives a numeric string", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(cmd("remove-lines", { lines: "3" }));
    expect(errors).toEqual([]);
  });

  test("returns no error when a number arg receives an actual number", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(cmd("remove-lines", { lines: 3 }));
    expect(errors).toEqual([]);
  });

  test("returns multiple errors when multiple things are wrong", () => {
    const p = new Pipeline({ commands: [] });
    // nonexistent command — should get at least 1 error and not crash
    const errors = p.validateCommand(cmd("nonexistent", { foo: "bar" }));
    expect(errors.length).toBeGreaterThan(0);
  });
});

//==============================================================================
// allowedValues validation
//==============================================================================

describe("allowedValues validation", () => {
  test("allows a valid value for an arg with allowedValues", async () => {
    const p = new Pipeline({ commands: [cmd("remove", { selector: "p", preserve: "all" })] });
    const working = await p.execute({ history: [], text: "<p>hello</p>" });
    expect(working.abort).toBeFalsy();
  });

  test("aborts when an arg value is not in allowedValues", async () => {
    const p = new Pipeline({ commands: [cmd("remove", { selector: "p", preserve: "invalid" })] });
    const working = await p.execute({ history: [], text: "<p>hello</p>" });
    expect(working.abort).toBe(true);
  });

  test("does not abort when an optional arg with allowedValues is omitted", async () => {
    const p = new Pipeline({ commands: [cmd("remove", { selector: "p" })] });
    const working = await p.execute({ history: [], text: "<p>hello</p>" });
    expect(working.abort).toBeFalsy();
  });
});

//==============================================================================
// detectMimeType
//==============================================================================

describe("detectMimeType", () => {
  test("detects JSON object", () => {
    expect(detectMimeType('{"key": "value"}')).toBe("application/json");
  });

  test("detects JSON array", () => {
    expect(detectMimeType("[1, 2, 3]")).toBe("application/json");
  });

  test("does not classify invalid JSON as application/json", () => {
    expect(detectMimeType("{not valid json")).not.toBe("application/json");
  });

  test("detects HTML by doctype", () => {
    expect(detectMimeType("<!DOCTYPE html><html></html>")).toBe("text/html");
  });

  test("detects HTML by common tag", () => {
    expect(detectMimeType("<div>hello</div>")).toBe("text/html");
  });

  test("detects CSV", () => {
    const csv = "name,age,city\nAlice,30,NYC\nBob,25,LA\n";
    expect(detectMimeType(csv)).toBe("text/csv");
  });

  test("falls back to text/plain for plain text", () => {
    expect(detectMimeType("just some plain text")).toBe("text/plain");
  });

  test("handles non-string input by converting it", () => {
    expect(detectMimeType(42)).toBe("text/plain");
  });
});

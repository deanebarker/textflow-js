import { expect, test } from "vitest";
import { execute } from "./helpers.js";
import { Pipeline, WorkingData } from "../src/textflow.js";

test("Registers and retrieves a static alias", () => {
  Pipeline.registerAlias("test-alias-1", "remove", {
    selector: "a",
    preserve: "text",
  });

  const pipeline = new Pipeline({ commands: [] });
  const alias = pipeline.getAlias("test-alias-1");

  expect(alias).toBeDefined();
  expect(alias.target).toBe("remove");
  expect(alias.presetArgs.selector).toBe("a");
  expect(alias.presetArgs.preserve).toBe("text");
});

test("Executes an alias with preset arguments", async () => {
  Pipeline.registerAlias("unhyperlink", "remove", {
    selector: "a",
    preserve: "text",
  });

  const result = await execute(
    [{ name: "unhyperlink" }],
    'Check <a href="https://example.com">this link</a> out!',
  );

  expect(result.text).toBe("Check this link out!");
});

test("Allows overriding preset arguments", async () => {
  Pipeline.registerAlias("strip-p", "remove", { selector: "p" });

  const result = await execute(
    [{ name: "strip-p", selector: "a" }],
    '<p>keep</p><a href="#">remove</a>',
  );

  expect(result.text).toBe("<p>keep</p>");
});

test("Registers instance-level aliases", () => {
  const pipeline = new Pipeline({ commands: [] });
  pipeline.registerInstanceAlias("test-inst", "wrap", {
    tag: "div",
    class: "container",
  });

  const alias = pipeline.getAlias("test-inst");

  expect(alias).toBeDefined();
  expect(alias.target).toBe("wrap");
});

test("Rejects alias with invalid target command", () => {
  expect(() => {
    Pipeline.registerAlias("bad-alias", "nonexistent-command");
  }).toThrow("target command \"nonexistent-command\" is not registered");
});

test("Includes aliases in validation", async () => {
  Pipeline.registerAlias("validate-test", "remove", { selector: "b" });

  const commandSet = {
    commands: [{ name: "validate-test", arguments: [] }],
  };

  const p = new Pipeline(commandSet);
  const errors = p.validate();

  expect(errors.length).toBe(0);
});

test("Merges preset and user arguments correctly", async () => {
  Pipeline.registerAlias("merge-test", "wrap", {
    tag: "div",
    class: "original",
  });

  const result = await execute(
    [{ name: "merge-test", class: "override" }],
    "content",
  );

  expect(result.text).toContain('class="override"');
  expect(result.text).not.toContain("original");
});

test("Preserves writeTo target through alias resolution", async () => {
  Pipeline.registerAlias("to-var", "set", { text: "hello" });

  let working = new WorkingData("ignored");
  const p = new Pipeline({
    commands: [{ name: "to-var", target: "myVar" }],
  });
  working = await p.execute(working);

  expect(working.vars.get("myVar")).toBe("hello");
});

import { expect, test, describe } from "vitest";
import { Pipeline } from "../../src/textflow.js";
import { execute } from "../helpers.js";

// Helper to build a command in the raw {name, arguments:[{key,value}]} format
// that Pipeline.validateCommand expects (mirrors tests/textflow.test.js).
function cmd(name, args = {}) {
  return {
    name,
    arguments: Object.entries(args).map(([key, value]) => ({ key, value })),
  };
}

//==============================================================================
// Existing behavior
//==============================================================================

describe("wrap — basic args", () => {
  test("wraps in a div by default", async () => {
    const result = await execute([{ name: "wrap" }], "foo");
    expect(result.text).toBe("<div>foo</div>");
  });

  test("uses custom tag", async () => {
    const result = await execute([{ name: "wrap", tag: "span" }], "x");
    expect(result.text).toBe("<span>x</span>");
  });

  test("accepts the tagName alias", async () => {
    const result = await execute([{ name: "wrap", tagName: "section" }], "x");
    expect(result.text).toBe("<section>x</section>");
  });

  test("adds a single class", async () => {
    const result = await execute([{ name: "wrap", class: "highlight" }], "x");
    expect(result.text).toBe('<div class="highlight">x</div>');
  });

  test("splits space-separated classes", async () => {
    const result = await execute(
      [{ name: "wrap", class: "btn primary large" }],
      "x",
    );
    expect(result.text).toBe('<div class="btn primary large">x</div>');
  });

  test("accepts the className alias", async () => {
    const result = await execute([{ name: "wrap", className: "foo" }], "x");
    expect(result.text).toBe('<div class="foo">x</div>');
  });

  test("adds an id", async () => {
    const result = await execute([{ name: "wrap", id: "main" }], "x");
    expect(result.text).toBe('<div id="main">x</div>');
  });

  test("combines tag, class, and id", async () => {
    const result = await execute(
      [{ name: "wrap", tag: "a", class: "btn", id: "go" }],
      "x",
    );
    expect(result.text).toBe('<a class="btn" id="go">x</a>');
  });
});

//==============================================================================
// attr_* wildcard
//==============================================================================

describe("wrap — attr_* wildcard", () => {
  test("writes a single attr_<name>", async () => {
    const result = await execute(
      [{ name: "wrap", tag: "a", attr_href: "https://example.com" }],
      "go",
    );
    expect(result.text).toBe('<a href="https://example.com">go</a>');
  });

  test("supports hyphenated attribute names via attr_<name-with-hyphen>", async () => {
    const result = await execute(
      [{ name: "wrap", "attr_data-id": "42" }],
      "x",
    );
    expect(result.text).toBe('<div data-id="42">x</div>');
  });

  test("writes multiple attr_* args in order", async () => {
    const result = await execute(
      [
        {
          name: "wrap",
          tag: "input",
          attr_type: "text",
          attr_name: "email",
          attr_required: "",
        },
      ],
      "",
    );
    expect(result.text).toBe(
      '<input type="text" name="email" required="">',
    );
  });
});

//==============================================================================
// data_* wildcard
//==============================================================================

describe("wrap — data_* wildcard", () => {
  test("writes data_<name> as data-<name>", async () => {
    const result = await execute(
      [{ name: "wrap", data_foo: "bar" }],
      "x",
    );
    expect(result.text).toBe('<div data-foo="bar">x</div>');
  });

  test("supports hyphenated names: data_user-id -> data-user-id", async () => {
    const result = await execute(
      [{ name: "wrap", "data_user-id": "7" }],
      "x",
    );
    expect(result.text).toBe('<div data-user-id="7">x</div>');
  });

  test("writes multiple data_* args", async () => {
    const result = await execute(
      [{ name: "wrap", data_foo: "1", data_bar: "2" }],
      "x",
    );
    expect(result.text).toBe('<div data-foo="1" data-bar="2">x</div>');
  });
});

//==============================================================================
// aria_* wildcard
//==============================================================================

describe("wrap — aria_* wildcard", () => {
  test("writes aria_<name> as aria-<name>", async () => {
    const result = await execute(
      [{ name: "wrap", tag: "button", aria_label: "Close" }],
      "X",
    );
    expect(result.text).toBe('<button aria-label="Close">X</button>');
  });

  test("writes multiple aria_* args", async () => {
    const result = await execute(
      [
        {
          name: "wrap",
          tag: "button",
          aria_label: "Close",
          aria_pressed: "false",
        },
      ],
      "X",
    );
    expect(result.text).toBe(
      '<button aria-label="Close" aria-pressed="false">X</button>',
    );
  });
});

//==============================================================================
// Combined wildcards
//==============================================================================

describe("wrap — combined prefixes", () => {
  test("attr_, data_, and aria_ all work together with class and id", async () => {
    const result = await execute(
      [
        {
          name: "wrap",
          tag: "button",
          class: "btn",
          id: "submit",
          attr_type: "submit",
          data_foo: "bar",
          aria_label: "Submit form",
        },
      ],
      "OK",
    );
    expect(result.text).toBe(
      '<button class="btn" id="submit" type="submit" data-foo="bar" aria-label="Submit form">OK</button>',
    );
  });
});

//==============================================================================
// Variable substitution through getArg
//==============================================================================

describe("wrap — variable substitution in wildcard values", () => {
  test("attr_* values resolve {varName} from pipeline vars", async () => {
    const p = new Pipeline({
      commands: [cmd("wrap", { tag: "a", attr_href: "{url}" })],
    });
    p.vars.set("url", "https://example.com");
    const working = await p.execute("go");
    expect(working.text).toBe('<a href="https://example.com">go</a>');
  });

  test("data_* values resolve {varName} from pipeline vars", async () => {
    const p = new Pipeline({
      commands: [cmd("wrap", { data_id: "{id}" })],
    });
    p.vars.set("id", "abc");
    const working = await p.execute("x");
    expect(working.text).toBe('<div data-id="abc">x</div>');
  });

  test("aria_* values resolve {varName} from pipeline vars", async () => {
    const p = new Pipeline({
      commands: [cmd("wrap", { tag: "button", aria_label: "{lbl}" })],
    });
    p.vars.set("lbl", "Close dialog");
    const working = await p.execute("X");
    expect(working.text).toBe(
      '<button aria-label="Close dialog">X</button>',
    );
  });
});

//==============================================================================
// Validation
//==============================================================================

describe("wrap — parseValidators", () => {
  test("rejects an invalid tag name", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(cmd("wrap", { tag: "1bad" }));
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => /tag name/i.test(e))).toBe(true);
  });

  test("accepts a valid tag name", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(cmd("wrap", { tag: "section" }));
    expect(errors).toEqual([]);
  });

  test("rejects an attr_ argument with an invalid attribute name", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(
      cmd("wrap", { "attr_1bad": "x" }),
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => /valid HTML attribute name/i.test(e))).toBe(true);
  });

  test("rejects a data_ argument with an invalid attribute name", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(
      cmd("wrap", { "data_-bad": "x" }),
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  test("rejects an aria_ argument with an invalid attribute name", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(
      cmd("wrap", { "aria_!bad": "x" }),
    );
    expect(errors.length).toBeGreaterThan(0);
  });

  test("accepts hyphenated attribute names after the prefix", () => {
    const p = new Pipeline({ commands: [] });
    const errors = p.validateCommand(
      cmd("wrap", {
        "attr_data-id": "1",
        "data_user-id": "2",
        "aria_label": "ok",
      }),
    );
    expect(errors).toEqual([]);
  });
});

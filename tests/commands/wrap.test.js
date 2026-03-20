import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Wrap content in a div by default", async () => {
  let command = { name: "wrap" };
  const result = await execute([command], "foo");
  expect(result.text).toBe("<div>foo</div>");
});

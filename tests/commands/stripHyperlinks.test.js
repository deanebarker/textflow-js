import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Strips hyperlinks from HTML", async () => {
  let command = { name: "strip-hyperlinks" };
  const result = await execute([command], "<p><a href='https://example.com'>Example</a></p>");
  expect(result.text).toBe("<p>Example</p>");
});

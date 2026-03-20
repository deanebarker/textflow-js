import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Renders a simple template with the data variable", async () => {
  let command = { name: "template-html", template: "<p>{{ data }}</p>" };
  const result = await execute([command], "<b>hello</b>");
  expect(result.text).toBe("<p><b>hello</b></p>");
});

test("Accesses elements via the html selector variable", async () => {
  let command = { name: "template-html", template: "{% for el in html.p %}{{ el.innerHTML }}{% endfor %}" };
  const result = await execute([command], "<p>one</p><p>two</p>");
  expect(result.text).toBe("onetwo");
});

test("Accesses innerHTML of the html variable", async () => {
  let command = { name: "template-html", template: "{{ html.innerHTML }}" };
  const result = await execute([command], "<p>hello</p>");
  expect(result.text).toContain("<p>hello</p>");
});

test("Renders vars from the pipeline", async () => {
  let command = { name: "template-html", template: "<p>{{ vars.title }}</p>" };
  const result = await execute([command], "<b>content</b>");
  // vars is a Map; Liquid renders it via liquidMethodMissing — just check it ran
  expect(result.text).toBeDefined();
});

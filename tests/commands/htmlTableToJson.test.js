import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Converts simple HTML table to JSON", async () => {
  const command = { name: "table-to-json" };
  const html = `
    <table>
      <tr><th>Name</th><th>Age</th></tr>
      <tr><td>Alice</td><td>30</td></tr>
      <tr><td>Bob</td><td>25</td></tr>
    </table>
  `;
  const result = await execute([command], html);
  const parsed = JSON.parse(result.text);

  expect(Array.isArray(parsed)).toBe(true);
  expect(parsed.length).toBe(2);
  expect(parsed[0].name).toBe("Alice");
  expect(parsed[0].age).toBe("30");
  expect(parsed[1].name).toBe("Bob");
});

test("Uses TH tags as property names", async () => {
  const command = { name: "table-to-json" };
  const html = `
    <table>
      <tr><th>First</th><th>Last</th></tr>
      <tr><td>John</td><td>Doe</td></tr>
    </table>
  `;
  const result = await execute([command], html);
  const parsed = JSON.parse(result.text);

  expect(parsed[0]).toHaveProperty("first");
  expect(parsed[0]).toHaveProperty("last");
  expect(parsed[0].first).toBe("John");
  expect(parsed[0].last).toBe("Doe");
});

test("Generates column names when no TH tags present", async () => {
  const command = { name: "table-to-json" };
  const html = `
    <table>
      <tr><td>Alice</td><td>30</td></tr>
      <tr><td>Bob</td><td>25</td></tr>
    </table>
  `;
  const result = await execute([command], html);
  const parsed = JSON.parse(result.text);

  expect(parsed[0]).toHaveProperty("column1");
  expect(parsed[0]).toHaveProperty("column2");
  expect(parsed[0].column1).toBe("Alice");
  expect(parsed[0].column2).toBe("30");
});

test("Handles table with thead and tbody", async () => {
  const command = { name: "table-to-json" };
  const html = `
    <table>
      <thead>
        <tr><th>Product</th><th>Price</th></tr>
      </thead>
      <tbody>
        <tr><td>Apple</td><td>$1.00</td></tr>
        <tr><td>Orange</td><td>$0.50</td></tr>
      </tbody>
    </table>
  `;
  const result = await execute([command], html);
  const parsed = JSON.parse(result.text);

  expect(parsed.length).toBe(2);
  expect(parsed[0].product).toBe("Apple");
  expect(parsed[0].price).toBe("$1.00");
  expect(parsed[1].product).toBe("Orange");
});

test("Extracts table with selector", async () => {
  const command = { name: "table-to-json", selector: "#main-table" };
  const html = `
    <div>
      <table id="main-table">
        <tr><th>Item</th></tr>
        <tr><td>Test</td></tr>
      </table>
      <table id="other-table">
        <tr><th>Other</th></tr>
      </table>
    </div>
  `;
  const result = await execute([command], html);
  const parsed = JSON.parse(result.text);

  expect(parsed[0].item).toBe("Test");
});

test("Throws error when selector doesn't match", async () => {
  const command = { name: "table-to-json", selector: ".nonexistent" };
  const html = "<table><tr><td>Data</td></tr></table>";
  const result = await execute([command], html);
  expect(result.text).toBeUndefined();
});

test("Throws error when selected element is not a table", async () => {
  const command = { name: "table-to-json", selector: ".container" };
  const html = '<div class="container"><table><tr><td>Data</td></tr></table></div>';
  const result = await execute([command], html);
  expect(result.text).toBeUndefined();
});

test("Throws error when no table found without selector", async () => {
  const command = { name: "table-to-json" };
  const html = "<div><p>No table here</p></div>";
  const result = await execute([command], html);
  expect(result.text).toBeUndefined();
});

test("Returns valid JSON output", async () => {
  const command = { name: "table-to-json" };
  const html = `
    <table>
      <tr><th>A</th></tr>
      <tr><td>1</td></tr>
    </table>
  `;
  const result = await execute([command], html);
  expect(() => JSON.parse(result.text)).not.toThrow();
});

test("Handles empty table with headers", async () => {
  const command = { name: "table-to-json" };
  const html = `
    <table>
      <tr><th>Column1</th><th>Column2</th></tr>
    </table>
  `;
  const result = await execute([command], html);
  const parsed = JSON.parse(result.text);
  expect(parsed.length).toBe(0);
});

test("Trims whitespace from cell content", async () => {
  const command = { name: "table-to-json" };
  const html = `
    <table>
      <tr><th>  Name  </th></tr>
      <tr><td>  Alice  </td></tr>
    </table>
  `;
  const result = await execute([command], html);
  const parsed = JSON.parse(result.text);
  expect(parsed[0]["name"]).toBe("Alice");
});

test("Handles tables with multiple rows and columns", async () => {
  const command = { name: "table-to-json" };
  const html = `
    <table>
      <tr><th>A</th><th>B</th><th>C</th></tr>
      <tr><td>1</td><td>2</td><td>3</td></tr>
      <tr><td>4</td><td>5</td><td>6</td></tr>
      <tr><td>7</td><td>8</td><td>9</td></tr>
    </table>
  `;
  const result = await execute([command], html);
  const parsed = JSON.parse(result.text);
  expect(parsed.length).toBe(3);
  expect(parsed[2].a).toBe("7");
  expect(parsed[2].c).toBe("9");
});

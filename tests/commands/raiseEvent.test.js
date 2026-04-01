import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Requires a name argument", async () => {
  const command = { name: "raise-event" };
  const result = await execute([command], "test data");
  expect(result.text).toBeUndefined();
});

test("Does not modify working.text", async () => {
  const command = { name: "raise-event", event:"custom-event" };
  const originalText = "test data";
  const result = await execute([command], originalText);
  expect(result.text).toBe(originalText);
});

test("Returns working object unchanged", async () => {
  const command = { name: "raise-event", event:"my-event" };
  const originalText = "<div>Content</div>";
  const result = await execute([command], originalText);
  expect(result.text).toBe(originalText);
});

test("Works with different event names", async () => {
  const command = { name: "raise-event", event:"debug-event" };
  const result = await execute([command], "data");
  expect(result.text).toBe("data");
});

test("Works with special characters in event name", async () => {
  const command = { name: "raise-event", event:"my-custom-event-123" };
  const result = await execute([command], "test");
  expect(result.text).toBe("test");
});

test("Preserves working data unchanged", async () => {
  const command = { name: "raise-event", event:"test-event" };
  const result = await execute([command], "test");
  expect(result.text).toBe("test");
});

test("Works with empty input", async () => {
  const command = { name: "raise-event", event:"empty-event" };
  const result = await execute([command], "");
  expect(result.text).toBe("");
});

test("Works with large input", async () => {
  const command = { name: "raise-event", event:"large-event" };
  const largeText = "x".repeat(10000);
  const result = await execute([command], largeText);
  expect(result.text).toBe(largeText);
  expect(result.text.length).toBe(10000);
});

import { expect, test } from "vitest";
import { execute } from "../helpers.js";

test("Converts relative href to absolute URL", async () => {
  const command = { name: "absolutize", url: "https://example.com/news/" };
  const result = await execute([command], '<a href="article.html">Read more</a>');
  expect(result.text).toBe('<a href="https://example.com/news/article.html">Read more</a>');
});

test("Converts relative img src to absolute URL", async () => {
  const command = { name: "absolutize", url: "https://example.com/" };
  const result = await execute([command], '<img src="images/photo.jpg">');
  expect(result.text).toBe('<img src="https://example.com/images/photo.jpg">');
});

test("Converts root-relative href to absolute URL", async () => {
  const command = { name: "absolutize", url: "https://example.com/news/" };
  const result = await execute([command], '<a href="/about">About</a>');
  expect(result.text).toBe('<a href="https://example.com/about">About</a>');
});

test("Leaves already-absolute href unchanged", async () => {
  const command = { name: "absolutize", url: "https://example.com/" };
  const result = await execute([command], '<a href="https://other.com/page">Link</a>');
  expect(result.text).toBe('<a href="https://other.com/page">Link</a>');
});

test("Converts both links and images in the same document", async () => {
  const command = { name: "absolutize", url: "https://example.com/" };
  const result = await execute([command], '<a href="page.html">Link</a><img src="img.png">');
  expect(result.text).toBe('<a href="https://example.com/page.html">Link</a><img src="https://example.com/img.png">');
});


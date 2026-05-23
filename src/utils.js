// Even just the first 10 characters allows for 1.1 trillion possible values...
export async function sha256Hash(input, limit = 10) {
  const bytes = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, limit);
}

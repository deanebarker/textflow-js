import { Liquid } from "liquidjs";

export function getLiquidEngine() {
  const engine = new Liquid();
  engine.registerFilter("type_of", (v) => {
    if (v === null || v === undefined) return "nil";
    if (Array.isArray(v)) return "array";
    return typeof v;
  });
  return engine;
}

export async function parseHtml(html) {
  if (typeof window !== "undefined") {
    return new DOMParser().parseFromString(html, "text/html");
  } else {
    const { JSDOM } = await import(/* webpackIgnore: true */ 'jsdom');
    const dom = new JSDOM(html);
    return dom.window.document;
  }
}

export async function getDom() {
  if (typeof window !== "undefined") {
    return document;
  } else {
    const { JSDOM } = await import(/* webpackIgnore: true */ 'jsdom');
    const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    return dom.window.document;
  }
}

export function toCamelCase(header) {
  return (
    String(header || "")
      .trim()
      // remove leading/trailing non-alphanumerics
      .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "")
      // split on spaces, underscores, dashes, etc.
      .split(/[\s_\-]+/)
      .filter(Boolean)
      .map((word, index) => {
        const lower = word.toLowerCase();
        if (index === 0) return lower;
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join("")
  );
}

export function detectMimeType(input) {
  const s = typeof input === "string" ? input : String(input);
  const t = s.trim();

  // 1) JSON (only objects/arrays to avoid misclassifying scalars like "42")
  if (t.startsWith("{") || t.startsWith("[")) {
    try {
      JSON.parse(t);
      return "application/json";
    } catch (_) {
      /* not JSON */
    }
  }

  // 2) HTML (doctype, common tags, or a paired tag)
  if (looksLikeHTML(t)) {
    return "text/html";
  }

  // 3) CSV (RFC4180-ish heuristic: ≥2 non-empty lines, consistent comma-separated column counts ≥2)
  if (looksLikeCSV(t)) {
    return "text/csv";
  }

  // 4) Fallback
  return "text/plain";

  function looksLikeHTML(str) {
    if (!str || str[0] !== "<") return false;
    if (/^<!doctype\s+html>/i.test(str)) return true;
    if (
      /<(html|head|body|script|style|div|span|p|a|ul|ol|li|table|tr|td|section|article|header|footer)\b/i.test(
        str
      )
    ) {
      return true;
    }
    return /<([A-Za-z][\w:-]*)(\s[^>]*)?>[\s\S]*<\/\1>/m.test(str);
  }

  function looksLikeCSV(str) {
    if (!str) return false;

    const lines = str.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length < 2) return false;
    const sample = lines.slice(0, 50);

    if (!sample.some((l) => l.includes(","))) return false;

    const counts = sample.map((l) => splitCsvLine(l).length);

    const freq = {};
    for (const c of counts) freq[c] = (freq[c] || 0) + 1;
    let modeCount = 0,
      modeCols = 0;
    for (const k in freq) {
      const cols = Number(k),
        f = freq[k];
      if (f > modeCount) {
        modeCount = f;
        modeCols = cols;
      }
    }

    if (
      modeCols >= 2 &&
      modeCount >= Math.max(2, Math.ceil(sample.length * 0.6))
    ) {
      return true;
    }

    return false;
  }

  function splitCsvLine(line) {
    const out = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];

      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out;
  }
}
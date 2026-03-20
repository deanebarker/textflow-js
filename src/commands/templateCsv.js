import {
  Liquid,
  Drop,
} from "liquidjs";

async function templateCsv(working, command, p) {
  let template = command.getArg("template");

  if (template == null && command.getArg("url")) {
    const response = await fetch(command.getArg("url"));
    template = await response.text();
  }
  
  if (template == null && command.getArg("templateSelector")) {
    template = document.querySelector(
      command.getArg("templateSelector")
    ).innerHTML;
  }

  const engine = new Liquid();
  const renderedText = await engine.parseAndRender(template, {
    data: csvToObjects(working.text),
    vars: p.vars,
  });
  return {
    text: renderedText,
    contentType: "text/html",
  };
}
templateCsv.title = "Template CSV";
templateCsv.description = "Apply a Liquid template to CSV data.";
templateCsv.args = [
  { name: "template", type: "string", description: "Liquid template string" },
  { name: "url", type: "string", description: "URL to fetch template from" },
  {
    name: "templateSelector",
    type: "string",
    description: "CSS selector to get template from DOM",
  },
];
templateCsv.allowedContentTypes = ["csv"];

export default templateCsv;

// --- Header → camelCase helper -------------------------------------------
function toCamelCase(header) {
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

// --- Low-level CSV → rows (array-of-arrays) -------------------------------
function parseCsvToRows(csvText) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  const text = String(csvText || "");
  const len = text.length;

  for (let i = 0; i < len; i++) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes) {
        // If the next char is also a quote, it's an escaped quote
        if (i + 1 < len && text[i + 1] === '"') {
          field += '"';
          i++; // skip the next quote
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        // Opening quote (only if field is empty, or treat as literal if you want)
        inQuotes = true;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      // End of row (handle CRLF / LF / CR)
      // If it's \r\n, we'll skip the \n in the next iteration
      if (char === "\r" && i + 1 < len && text[i + 1] === "\n") {
        i++;
      }
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  // Last field / row (if any)
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

// --- High-level: CSV → array of objects with camelCased headers ----------
function csvToObjects(csvText) {
  const rows = parseCsvToRows(csvText);
  if (!rows.length) return [];

  const rawHeaders = rows[0];
  const headers = rawHeaders.map(toCamelCase);

  const dataRows = rows.slice(1);
  const objects = dataRows
    .filter((r) => r.some((cell) => String(cell).trim().length > 0)) // skip totally empty rows
    .map((row) => {
      const obj = {};
      for (let i = 0; i < headers.length; i++) {
        const key = headers[i];
        if (!key) continue; // skip empty header cells
        obj[key] = row[i] != null ? String(row[i]).trim() : "";
      }
      return obj;
    });

  return objects;
}

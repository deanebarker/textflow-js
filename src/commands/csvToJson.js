import { toCamelCase } from "../helpers.js";

function csvToJson(working) {
  const data = csvToObjects(working.text);
  return JSON.stringify(data, null, 2);
}

// Meta

csvToJson.title = "CSV to JSON";
csvToJson.description = "Convert CSV data to a JSON array of objects with camelCased property names.";
csvToJson.args = [];

// Helpers

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

export default csvToJson;

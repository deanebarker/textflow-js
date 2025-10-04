import { Liquid } from "https://cdn.jsdelivr.net/npm/liquidjs@10.21.1/+esm";

async function makeTable(working, command, p) {
  const defaultTableCss = `

  table {
  border-collapse: collapse;
}
td,
th {
  text-align: left;
  padding: 0.5rem;
  border-bottom: solid 1px rgb(240,240,240);
  padding-right: 1rem;
}
th {
  border-bottom-width: 3px;
}
tr:last-of-type td {
  border-bottom: none;
}
td.numeric,
th.numeric {
  text-align: right;
}
  tr[data-nav] {
  cursor: pointer;
}
tr[data-nav]:hover {
  background-color: rgb(250,250,250);
}
`;

  // Turn the input into a array of Maps
  let data = [];
  if (working.getContentType().includes("json")) {
    const json = JSON.parse(working.text);
    data = json.map((o) => new Map(Object.entries(o)));
  } else if (working.getContentType().includes("csv")) {
    data = parseCSVtoMaps(working.text);
  }

  // Get the column arguments
  const columnArgPrefix = "col_";
  let columnArgs = command.arguments
    .filter((a) => a.key.startsWith(columnArgPrefix))
    .map((a) => a.key.replace(columnArgPrefix, "").trim());
  if (columnArgs.length === 0 && data.length > 0) {
    // No column args, so use all keys from first row
    columnArgs = Array.from(data[0].keys());
  }

  // Get the column titles
  let columnTitles = new Map();
  for (const col of columnArgs) {
    columnTitles.set(col, command.getArg(columnArgPrefix + col) ?? col);
  }

  let clickUrl = command.getArg("clickUrl");
  let html = await mapsToTable(data, columnTitles, clickUrl);
  let css = `<style>${defaultTableCss}</style>`;
  return {
    text: html.outerHTML + css,
    contentType: "text/html",
  };
}
makeTable.title = "Make Table";
makeTable.description =
  "Convert JSON or CSV data into an HTML table with optional column customization.";
makeTable.args = [
  {
    name: "col_*",
    type: "string",
    description: "Column titles (e.g., col_name:Full Name)",
  },
  {
    name: "clickUrl",
    type: "string",
    description: "URL template for clickable rows (uses Liquid templating)",
  },
];
makeTable.allowedContentTypes = ["json", "csv"];

function parseCSVtoMaps(
  input,
  { delimiter = ",", trim = false, skipEmptyRows = true } = {}
) {
  if (typeof input !== "string") input = String(input ?? "");

  // Strip BOM if present
  if (input.charCodeAt(0) === 0xfeff) input = input.slice(1);

  // Normalize newlines
  input = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const rows = [];
  let row = [];
  let field = "";

  let i = 0;
  const len = input.length;
  const D = delimiter;
  const NL = "\n";

  let inQuotes = false;
  while (i < len) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = input[i + 1];
        if (next === '"') {
          field += '"'; // Escaped quote
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += ch;
        i++;
        continue;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (ch === D) {
        row.push(trim ? field.trim() : field);
        field = "";
        i++;
        continue;
      }
      if (ch === NL) {
        row.push(trim ? field.trim() : field);
        field = "";
        if (!(skipEmptyRows && row.every((v) => v === ""))) {
          rows.push(row);
        }
        row = [];
        i++;
        continue;
      }
      field += ch;
      i++;
    }
  }

  // Flush last field/row
  row.push(trim ? field.trim() : field);
  if (!(skipEmptyRows && row.every((v) => v === ""))) {
    rows.push(row);
  }

  if (rows.length === 0) return [];

  // First row is headers
  const headers = rows[0];
  const result = [];

  for (let r = 1; r < rows.length; r++) {
    const record = new Map();
    const cur = rows[r];
    const n = Math.max(headers.length, cur.length);
    for (let c = 0; c < n; c++) {
      const key = headers[c] ?? `__col${c + 1}`;
      record.set(key, cur[c] ?? "");
    }
    result.push(record);
  }

  return result;
}

/**
 * Create an HTMLTableElement from an array of Maps.
 * - rows: Array<Map<string, any>> (each Map is a row; keys = column names)
 * - fieldsMap (optional): Map<key, title>
 *     * If provided, ONLY these keys are displayed, in insertion order.
 *     * <th> text uses the mapped title (value).
 * - For every TH/TD:
 *     * adds class "col-<slugified-key>"
 *     * adds class "numeric" if that column is numeric across all rows
 *
 * @param {Map<string, any>[]} rows
 * @param {Map<string, string>} [fieldsMap]
 * @returns {HTMLTableElement}
 */
async function mapsToTable(rows, fieldsMap, clickUrl) {
  const table = document.createElement("table");
  const thead = table.createTHead();
  const tbody = table.createTBody();

  const hasRows = Array.isArray(rows) && rows.length > 0;

  const engine = new Liquid({
    cache: true,
  });

  // Determine columns
  const columns =
    fieldsMap instanceof Map
      ? Array.from(fieldsMap.keys())
      : computeColumns(rows || []);

  // Column metadata
  const colMeta = columns.map((key) => ({
    key,
    title:
      fieldsMap instanceof Map && fieldsMap.has(key)
        ? String(fieldsMap.get(key))
        : String(key),
    className: "col-" + toClassName(key),
    numeric: hasRows && rows.every((m) => isNumericLike(m.get(key))),
  }));

  // Header
  const trh = thead.insertRow();
  for (const col of colMeta) {
    const th = document.createElement("th");
    th.textContent = col.title;
    th.classList.add(col.className);
    if (col.numeric) th.classList.add("numeric");
    trh.appendChild(th);
  }

  // Body
  if (hasRows) {
    for (const row of rows) {
      const tr = tbody.insertRow();

      if (clickUrl) {
        const clickTarget = await engine.parseAndRender(clickUrl, {
          row: Object.fromEntries(row),
        });
        tr.setAttribute("onclick", `window.open('${clickTarget}', '_blank')`);
        tr.dataset.nav = "true";
      }

      for (const col of colMeta) {
        const td = document.createElement("td");
        const v = row.get(col.key);
        td.textContent = v == null ? "" : String(v);
        td.classList.add(col.className);
        if (col.numeric) td.classList.add("numeric");
        tr.appendChild(td);
      }
    }
  }

  return table;

  // --- helpers ---
  function computeColumns(rs) {
    const seen = new Set();
    const ordered = [];
    if (rs.length) {
      for (const k of rs[0].keys()) {
        seen.add(k);
        ordered.push(k);
      }
    }
    for (const m of rs) {
      for (const k of m.keys()) {
        if (!seen.has(k)) {
          seen.add(k);
          ordered.push(k);
        }
      }
    }
    return ordered;
  }

  function toClassName(key) {
    let s = String(key)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
    if (/^[0-9]/.test(s)) s = "c-" + s; // class can't start with a digit
    return s || "col";
  }

  // NEW: numeric if number OR a string that fully converts to a finite number
  // Replace your existing isNumericLike with this:
  function isNumericLike(x) {
    if (typeof x === "number") return Number.isFinite(x);
    if (typeof x !== "string") return false;

    let s = x.trim();
    if (s === "") return false;

    // Allow $ anywhere (e.g., "$1,234", "$ 1,234", "$-1,234"); remove and re-trim.
    s = s.replace(/\$/g, "").trim();

    // Validate either plain digits or properly grouped thousands with commas.
    // Optional leading sign; optional decimal part.
    const commaPattern = /^[+-]?\d{1,3}(?:,\d{3})*(?:\.\d+)?$/;
    const plainPattern = /^[+-]?\d+(?:\.\d+)?$/;

    if (!(commaPattern.test(s) || plainPattern.test(s))) return false;

    // Normalize commas and evaluate
    const n = Number(s.replace(/,/g, ""));
    return Number.isFinite(n);
  }
}

export default makeTable;

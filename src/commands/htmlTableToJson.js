import { parseHtml, toCamelCase } from "../helpers.js";

async function htmlTableToJson(working, command) {
  const selector = command.getArg("selector") || "table";

  // Parse the HTML and extract the selected element
  const doc = await parseHtml(working.text);
  const tableElement = doc.querySelector(selector);

  if (!tableElement) {
    throw new Error(`Selector "${selector}" did not match any elements`);
  }

  if (tableElement.tagName.toLowerCase() !== "table") {
    throw new Error(`Selected element is a ${tableElement.tagName} tag, not a TABLE tag`);
  }

  const table = tableElement;

  // Extract headers from TH tags
  let headers = [];
  let bodyRows = [];

  // Get all rows
  const allRows = Array.from(table.querySelectorAll("tr"));

  // Check if first row has TH tags (header row)
  const firstRowHasTh = allRows.length > 0 && allRows[0].querySelector("th");

  // Extract headers if first row has TH tags
  if (firstRowHasTh) {
    const thCells = allRows[0].querySelectorAll("th");
    headers = Array.from(thCells).map(th => th.textContent.trim());
    bodyRows = allRows.slice(1);
  } else {
    // Check for thead/tbody structure
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    if (thead && tbody) {
      const theadRow = thead.querySelector("tr");
      if (theadRow) {
        const thCells = theadRow.querySelectorAll("th");
        if (thCells.length > 0) {
          headers = Array.from(thCells).map(th => th.textContent.trim());
        }
      }
      bodyRows = Array.from(tbody.querySelectorAll("tr"));
    } else {
      // No clear header structure
      bodyRows = allRows;
    }
  }

  // Convert rows to objects
  const rows = bodyRows.map((row) => {
    const cells = Array.from(row.querySelectorAll("td, th"));
    const obj = {};

    cells.forEach((cell, colIndex) => {
      const headerName = headers[colIndex] || `column${colIndex + 1}`;
      const camelCaseKey = toCamelCase(headerName);
      obj[camelCaseKey] = cell.textContent.trim();
    });

    return obj;
  });

  return JSON.stringify(rows, null, 2);
}

// Meta

htmlTableToJson.title = "HTML Table to JSON";
htmlTableToJson.description =
  "Parse an HTML table and convert it to a JSON array of objects. Uses TH tags as property names, or column1, column2, etc. if no headers are provided.";
htmlTableToJson.args = [
  {
    name: "selector",
    type: "string",
    description: "CSS selector to extract a specific TABLE element before parsing (default: table)",
  },
];

export default htmlTableToJson;

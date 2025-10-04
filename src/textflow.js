//==============================================================================
// IMPORTS
//==============================================================================

// Import all command functions
import setDebug from "./commands/setDebug.js";
import noOp from "./commands/noOp.js";
import absolutize from "./commands/absolutize.js";
import jsonataQuery from "./commands/jsonata.js";
import setContainerSize from "./commands/setContainerSize.js";
import http from "./commands/http.js";
import addCss from "./commands/addCss.js";
import extract from "./commands/extract.js";
import extractMultiple from "./commands/extractMultiple.js";
import wrap from "./commands/wrap.js";
import templateJson from "./commands/templateJson.js";
import templateHtml from "./commands/templateHtml.js";
import newLines from "./commands/newLines.js";
import markdown from "./commands/markdown.js";
import forceType from "./commands/forceType.js";
import makeTable from "./commands/makeTable.js";
import prepend from "./commands/prepend.js";
import append from "./commands/append.js";
import remove from "./commands/remove.js";
import removeLines from "./commands/removeLines.js";
import wrapLines from "./commands/wrapLines.js";

import debugTemplate from "./templates/debug.liquid";

//==============================================================================
// PUBLIC API FUNCTIONS
//==============================================================================

/**
 * Execute a pipeline of commands on input data
 */
export async function executePipeline(
  input,
  initialContentType,
  source,
  commands
) {
  let working = new WorkingData(input, initialContentType, source, null);
  const p = new Pipeline(commands);
  return await p.execute(working);
}

/**
 * Validate a set of commands without executing them
 */
export function validateCommands(commands) {
  const p = new Pipeline(commands);
  return p.validate(commands);
}

//==============================================================================
// PIPELINE CLASS - Main execution engine
//==============================================================================

export class Pipeline {
  //============================================================================
  // PROPERTIES
  //============================================================================

  headCommands = []; // Commands to run before the main, cleared after each run
  commands = []; // Main commands
  tailCommands = []; // Commands to run after the main, cleared after each run

  debug = false;

  static staticCommandLib = new Map(); // Commands available to all Pipeline instances
  instanceCommandLib = new Map(); // Commands specific to this instance

  //============================================================================
  // STATIC INITIALIZATION - Register all commands
  //============================================================================

  static {
    Pipeline.staticCommandLib.set("extract", extract);
    Pipeline.staticCommandLib.set("wrap", wrap);
    Pipeline.staticCommandLib.set("template-json", templateJson);
    Pipeline.staticCommandLib.set("make-table", makeTable);
    Pipeline.staticCommandLib.set("new-lines", newLines);
    Pipeline.staticCommandLib.set("markdown", markdown);
    Pipeline.staticCommandLib.set("http", http);
    Pipeline.staticCommandLib.set("extract-multiple", extractMultiple);
    Pipeline.staticCommandLib.set("extract-css", extractCss);
    Pipeline.staticCommandLib.set("add-css", addCss);
    Pipeline.staticCommandLib.set("set-container-size", setContainerSize);
    Pipeline.staticCommandLib.set("jsonata", jsonataQuery);
    Pipeline.staticCommandLib.set("absolutize", absolutize);
    Pipeline.staticCommandLib.set("template-html", templateHtml);
    Pipeline.staticCommandLib.set("set-type", forceType);
    Pipeline.staticCommandLib.set("set-debug", setDebug);
    Pipeline.staticCommandLib.set("no-op", noOp);
    Pipeline.staticCommandLib.set("prepend", prepend);
    Pipeline.staticCommandLib.set("append", append);
    Pipeline.staticCommandLib.set("remove", remove);
    Pipeline.staticCommandLib.set("remove-lines", removeLines);
    Pipeline.staticCommandLib.set("wrap-lines", wrapLines);
  }

  //============================================================================
  // CONSTRUCTOR
  //============================================================================

  constructor(commandSet) {
    this.commands = commandSet.commands;
    this.debug = this.commands.filter((c) => c.name === "set-debug").length > 0;
    this.commands = this.commands.filter((c) => c.name !== "set-debug");

    // They can add instance commands here
    this.emit("textflow:pipeline-created", { pipeline: this });
  }

  //============================================================================
  // VALIDATION METHODS
  //============================================================================

  /**
   * Validate all commands in the pipeline without executing them
   */
  validate() {
    let errors = [];

    for (let command of this.commands) {
      this.wrapCommand(command);

      // Ensure the command exists
      if (!this.getCommandFunction(command.name)) {
        errors.push(`Unknown command: "${command.name}"`);
        continue;
      }

      // Run its validators
      let func = this.getCommandFunction(command.name);
      for (let validator of func.parseValidators || []) {
        if (!validator.test(command)) {
          errors.push(`Command "${command.name}": ${validator.message}`);
        }
      }

      // If it's not allowed to have free arguments, make sure there are none
      if (func.allowFreeArguments === false) {
        const allowedArguments = func.args.map((arg) => arg.name);
        for (const freeArg of command.arguments.filter(
          (a) => !allowedArguments.includes(a.key)
        )) {
          errors.push(
            `Command "${command.name}": unknown argument "${freeArg.key}"`
          );
        }
      }
    }

    return errors;
  }

  //============================================================================
  // COMMAND MANAGEMENT METHODS
  //============================================================================

  /**
   * Get a command function by name, checking instance library first, then static
   */
  getCommandFunction(name) {
    if (this.instanceCommandLib.has(name)) {
      return this.instanceCommandLib.get(name);
    }

    if (Pipeline.staticCommandLib.has(name)) {
      return Pipeline.staticCommandLib.get(name);
    }

    return null;
  }

  /**
   * Add helper methods to a command object
   */
  wrapCommand(command) {
    command.getArg = function (name) {
      for (const possibleName of name.split(",").map((n) => n.trim())) {
        let value = this.arguments.filter((a) => a.key === possibleName)[0]
          ?.value;
        if (value !== null) return value;
      }
      return null;
    };
  }

  //============================================================================
  // MAIN EXECUTION METHOD
  //============================================================================

  /**
   * Execute the pipeline on working data
   */
  async execute(working) {
    // Check if pipeline execution should start
    if (
      !this.emit(
        "textflow:pipeline-starting",
        { working, pipeline: this },
        true
      )
    ) {
      this.log(
        "Pipeline cancelled by event listener on textflow:pipeline-starting"
      );
      return this.returnWorking(working);
    }

    let pipelineStart = performance.now();
    let initialInput = working.text;

    // Execute all commands in order
    for (let command of [
      ...this.headCommands,
      ...this.commands,
      ...this.tailCommands,
    ]) {
      this.wrapCommand(command);

      this.log(`Executing: ${command.name}`, working.text, command.arguments);

      // Initialize command history tracking
      let history = {};
      history.command = command;
      history.input = working.text;

      // Skip unknown commands
      if (!this.getCommandFunction(command.name)) {
        this.log(`Unknown command: ${command.name}`);
        continue;
      }

      try {
        let func = this.getCommandFunction(command.name);

        // Run validation
        for (let validator of func.parseValidators || []) {
          if (!validator.test(command)) {
            this.log(
              `Validation failed for command ${command.name}: ${validator.message}`
            );
            return new WorkingData(); // Stop execution if validation fails
          }
        }

        const beforeLength = working.text.length;

        // Check if command execution should proceed
        if (
          !this.emit(
            "textflow:command-starting",
            { working, command, pipeline: this },
            true
          )
        ) {
          this.log(
            "Command cancelled by event listener on textflow:command-starting"
          );
          continue;
        }

        // Execute the command
        let start = performance.now();
        let commandResult = await func(working, command, this);

        // Handle different return types from commands
        this.processCommandResult(working, commandResult);

        history.duration = performance.now() - start;

        this.emit("textflow:command-finished", {
          working,
          command,
          pipeline: this,
        });

        history.delta = working.text.length - beforeLength;
        history.output = working.text;
      } catch (ex) {
        this.log(`Error in command ${command.name}: ${ex.message}`);
        working.abort = true;
      }

      // Check for abort condition
      if (working.abort) {
        this.log(
          `Abort triggered by command: ${command.name}`,
          working,
          command
        );
        return new WorkingData(); // Do not return partial results
      }

      this.log(`Executed: ${command.name}`, command.arguments);
      working.history.push(history);
    }

    // Clean up and finalize
    this.tailCommands = []; // Clear tail commands after use

    let pipelineEnd = performance.now();
    working.history.duration = pipelineEnd - pipelineStart;
    working.history.input = initialInput;

    this.emit("textflow:pipeline-finished", { working, pipeline: this });

    return this.returnWorking(working);
  }

  //============================================================================
  // RESULT PROCESSING METHODS
  //============================================================================

  /**
   * Process the result returned from a command function
   */
  processCommandResult(working, commandResult) {
    // Note: originally, I just had the functions modify the working object directly.
    // However, in the future, I might introduce the concept of variables.
    // If I do, then the result of a command might be routed to a variable instead of the main text.
    // Therefore, I will support three possible return types from command functions:
    // 1) A string: this replaces working.text
    // 2) A WorkingData object: this replaces the entire working object (DEPRECATED)
    // 3) A plain object with any of the properties of WorkingData: these properties are merged into working

    // They returned a string
    if (typeof commandResult === "string") {
      working.text = commandResult;
      return;
    }

    // They returned an object
    if (typeof commandResult === "object" && commandResult !== null) {
      // If it's a WorkingData object (has the same constructor), replace the working object
      if (commandResult.constructor === working.constructor) {
        // Copy all properties from the returned object
        Object.assign(working, commandResult);
        return;
      }

      // It's a plain object with properties to update
      if (commandResult.text !== undefined) {
        working.text = commandResult.text;
      }

      if (commandResult.contentType !== undefined) {
        working.contentType = commandResult.contentType;
      }

      if (commandResult.source !== undefined) {
        working.source = commandResult.source;
      }

      if (commandResult.container !== undefined) {
        working.container = {
          ...working.container,
          ...commandResult.container,
        };
      }
    }
  }

  /**
   * Handle the return of working data with final validation
   */
  returnWorking(working) {
    if (
      !this.emit("textflow:returning-data", { working, pipeline: this }, true)
    ) {
      this.log(
        "Return of data cancelled by event listener on textflow:returning-data"
      );
      return new WorkingData();
    }
    return working;
  }

  //============================================================================
  // UTILITY METHODS
  //============================================================================

  /**
   * Emit a custom event
   */
  emit(type, detail, cancelable) {
    let event = new CustomEvent(type, {
      detail,
      cancelable: cancelable || false,
    });
    const eventResult = document.dispatchEvent(event);
    return eventResult;
  }

  /**
   * Log messages if debug mode is enabled
   */
  log(...args) {
    if (this.debug) console.log([...args]);
  }

  /**
   * Generate debug data for the pipeline execution
   */
  static async getDebugData(working) {
    const engine = new Liquid();
    engine.registerFilter("commas", function (value) {
      return Intl.NumberFormat("en-US").format(value);
    });
    const debugHtml = await engine.parseAndRenderSync(debugTemplate, {
      history: working.history,
    });
    const debugElement = document.createElement("debug-data");
    const shadowRoot = debugElement.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = debugHtml;
    return debugElement;
  }
}

//==============================================================================
// WORKING DATA CLASS - Represents data flowing through the pipeline
//==============================================================================

class WorkingData {
  //============================================================================
  // CONSTRUCTOR
  //============================================================================

  constructor(text, contentType, source, extension) {
    this.text = text;
    this.contentType = contentType;
    this.source = source;
    this.extension = extension;
    this.abort = false;
    this.styleBlocks = [];
    this.container = {};
    this.history = [];
  }

  //============================================================================
  // CONTENT TYPE DETECTION
  //============================================================================

  /**
   * Get the content type, using detection if not explicitly set
   */
  getContentType() {
    let type = this.contentType || this.contentTypeByExtension[this.extension];
    if (type) return type;

    return detectMimeType(this.text);
  }

  /**
   * Mapping of file extensions to content types
   */
  contentTypeByExtension = {
    json: "application/json",
    csv: "text/csv",
    xml: "application/xml",
    markdown: "text/markdown",
  };
}

//==============================================================================
// UTILITY FUNCTIONS - Content type detection and helpers
//==============================================================================

/**
 * Detect a MIME type from a string.
 * Returns one of: "text/html", "application/json", "text/csv", "text/plain".
 * Heuristics (in order): JSON (object/array), HTML, CSV (comma-separated), otherwise plain text.
 * Pure function: no side effects, no globals, no deps.
 * @param {string} input
 * @returns {"text/html"|"application/json"|"text/csv"|"text/plain"}
 */
function detectMimeType(input) {
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

  //============================================================================
  // HELPER FUNCTIONS
  //============================================================================

  /**
   * Check if a string looks like HTML
   */
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
    // Generic paired tag: <tag ...> ... </tag>
    return /<([A-Za-z][\w:-]*)(\s[^>]*)?>[\s\S]*<\/\1>/m.test(str);
  }

  /**
   * Check if a string looks like CSV data
   */
  function looksLikeCSV(str) {
    if (!str) return false;

    // Split into non-empty lines and cap the sample size
    const lines = str.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length < 2) return false; // require at least 2 lines
    const sample = lines.slice(0, 50);

    // Must contain commas somewhere (exclude TSV etc.)
    if (!sample.some((l) => l.includes(","))) return false;

    // Count columns per line using a minimal CSV splitter that respects quotes
    const counts = sample.map((l) => splitCsvLine(l).length);

    // Find the most common column count
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

    // Consider it CSV if the modal column count is ≥2 and
    // it covers a clear majority of the sample.
    if (
      modeCols >= 2 &&
      modeCount >= Math.max(2, Math.ceil(sample.length * 0.6))
    ) {
      return true;
    }

    return false;
  }

  /**
   * Minimal CSV line splitter (commas, quotes, and escaped quotes "")
   */
  function splitCsvLine(line) {
    const out = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];

      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
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

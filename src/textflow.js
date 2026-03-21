//==============================================================================
// IMPORTS
//==============================================================================

// Import all command functions
import setDebug from "./commands/setDebug.js";
import noOp from "./commands/noOp.js";
import absolutize from "./commands/absolutize.js";
import jsonataQuery from "./commands/jsonata.js";
import setContainerStyles from "./commands/setContainerStyles.js";
import http from "./commands/http.js";
import addCss from "./commands/addCss.js";
import extract from "./commands/extract.js";
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
import setAttribute from "./commands/setAttribute.js";
import outputVars from "./commands/outputVars.js";
import templateCsv from "./commands/templateCsv.js";

import debugTemplate from "./templates/debug.liquid";

import { Liquid } from "liquidjs";

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
  commands,
  vars
) {
  const working = new WorkingData(input, initialContentType, source, null);
  const p = new Pipeline(commands);
  p.vars = vars ?? new Map();
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

  vars = new Map(); // Variables for this pipeline execution

  static staticCommandLib = new Map(); // Commands available to all Pipeline instances
  instanceCommandLib = new Map(); // Commands specific to this instance

  //============================================================================
  // STATIC INITIALIZATION - Register all commands
  //============================================================================

  static {
    Pipeline.staticCommandLib.set("absolutize", absolutize);
    Pipeline.staticCommandLib.set("extract", extract);
    Pipeline.staticCommandLib.set("wrap", wrap);
    Pipeline.staticCommandLib.set("template-json", templateJson);
    Pipeline.staticCommandLib.set("make-table", makeTable);
    Pipeline.staticCommandLib.set("new-lines", newLines);
    Pipeline.staticCommandLib.set("markdown", markdown);
    Pipeline.staticCommandLib.set("http", http);
    Pipeline.staticCommandLib.set("add-css", addCss);
    Pipeline.staticCommandLib.set("set-container-styles", setContainerStyles);
    Pipeline.staticCommandLib.set("jsonata", jsonataQuery);
    Pipeline.staticCommandLib.set("template-html", templateHtml);
    Pipeline.staticCommandLib.set("set-type", forceType);
    Pipeline.staticCommandLib.set("set-debug", setDebug);
    Pipeline.staticCommandLib.set("no-op", noOp);
    Pipeline.staticCommandLib.set("prepend", prepend);
    Pipeline.staticCommandLib.set("append", append);
    Pipeline.staticCommandLib.set("remove", remove);
    Pipeline.staticCommandLib.set("remove-lines", removeLines);
    Pipeline.staticCommandLib.set("wrap-lines", wrapLines);
    Pipeline.staticCommandLib.set("set-attribute", setAttribute);
    Pipeline.staticCommandLib.set("output-vars", outputVars);
    Pipeline.staticCommandLib.set("template-csv", templateCsv);
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
    const errors = [];

    for (let command of this.commands) {
      errors.push(...this.validateCommand(command));
    }

    return errors;
  }

  /**
   * Validate a single command in the pipeline without executing it
   */
  validateCommand(command) {
    const errors = [];

    // Attach hasArg/getArg helpers so validators can inspect arguments by name
    this.wrapCommand(command, this);

    // Check that the command name is registered
    let func = this.getCommandFunction(command.name);
    if (!func) {
      errors.push(`Unknown command: "${command.name}"`);
      return errors;
    }

    // Check each provided argument against the command's arg definitions
    for (let argument of command.arguments) {
      const argDef =
        func.args && func.args.find((a) => a.name === argument.key);

      // If the arg definition specifies an allowedValues list, the value must appear in it
      if (
        argDef &&
        argDef.allowedValues &&
        !argDef.allowedValues.includes(argument.value)
      ) {
        errors.push(
          `Command "${command.name}", argument "${argument.key}": value "${argument.value}" is not in allowed values ${argDef.allowedValues.join(", ")}`,
        );
      }

      // If the arg definition specifies type "number", the value must be numeric
      if (argDef && argDef.type === "number" && isNaN(Number(argument.value))) {
        errors.push(
          `Command "${command.name}", argument "${argument.key}": value "${argument.value}" is not a valid number`,
        );
      }
    }

    // Run any custom parse validators defined on the command function
    for (let validator of func.parseValidators || []) {
      if (!validator.test) continue; // If there's no test function, skip it
      if (!validator.test(command)) {
        errors.push(`Command "${command.name}": ${validator.message}`);
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
  wrapCommand(command, pipeline) {
    command.pipeline = pipeline;
    command.hasArg = function (name) {
      for (const possibleName of name.split(",").map((n) => n.trim())) {
        if (this.arguments.some((a) => a.key === possibleName)) {
          return true;
        }
      }
      return false;
    };
    command.getArg = function (name) {
      for (const possibleName of name.split(",").map((n) => n.trim())) {
        let value = this.arguments.filter((a) => a.key === possibleName)[0]
          ?.value;

        if (value === undefined || value == null) continue;

        // Is this a variable reference?
        const variableRegex = /^{\w+}$/; // This is a regex because some Liquid templates might start and end with a brace
        if (typeof value === "string" && variableRegex.test(value)) {
          const varName = value.slice(1, -1).trim();
          if (this.pipeline.vars.has(varName)) {
            value = this.pipeline.vars.get(varName);
          } else {
            value = null;
          }
        }

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
        true,
      )
    ) {
      this.log(
        "Pipeline cancelled by event listener on textflow:pipeline-starting",
      );
      return this.returnWorking(working);
    }

    const pipelineStart = performance.now();
    const initialInput = working.text;

    // Execute all commands in order
    for (let command of [
      ...this.headCommands,
      ...this.commands,
      ...this.tailCommands,
    ]) {
      this.wrapCommand(command, this);

      this.log(`Executing: ${command.name}`, working.text, command.arguments);

      // Initialize command history tracking
      const history = {};
      history.command = {
        name: command.name,
        source: command.source,
        arguments: command.arguments,
      };
      history.input = working.text;

      // Skip unknown commands
      if (!this.getCommandFunction(command.name)) {
        this.log(`Unknown command: ${command.name}`);
        continue;
      }

      try {

        const validateErrors = this.validateCommand(command);
        if (validateErrors.length > 0) {
          this.log(`Validation failed for command ${command.name}:`, validateErrors);
          working.abort = true;
          return working;
        }

        const func = this.getCommandFunction(command.name);
        const beforeLength = working.text.length;

        // Check if command execution should proceed
        if (
          !this.emit(
            "textflow:command-starting",
            { working, command, pipeline: this },
            true,
          )
        ) {
          this.log(
            "Command cancelled by event listener on textflow:command-starting",
          );
          continue;
        }

        // Execute the command
        const start = performance.now();
        const commandResult = await func(working, command, this);

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
          command,
        );
        return new WorkingData(); // Do not return partial results
      }

      this.log(`Executed: ${command.name}`, command.arguments);
      working.history.push(history);
    }

    // Clean up and finalize
    this.tailCommands = []; // Clear tail commands after use

    const pipelineEnd = performance.now();
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
        "Return of data cancelled by event listener on textflow:returning-data",
      );
      return new WorkingData();
    }
    return working;
  }

  //============================================================================
  // UTILITY METHODS
  //============================================================================

  /**
   * Emit a custom event when running in a browser
   */
  emit(type, detail, cancelable) {
    const event = new CustomEvent(type, {
      detail,
      cancelable: cancelable || false,
    });

    if (typeof document === "undefined") return true; // We're not in a browser environment, so just return true to allow all events
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
// HELPERS CLASS - DOM utility methods for browser and Node.js environments
//==============================================================================

export class Helpers {
  static async parseHtml(html) {
    if (typeof window !== "undefined") {
      return new DOMParser().parseFromString(html, "text/html");
    } else {
      const { JSDOM } = await import('jsdom');
      const dom = new JSDOM(html);
      return dom.window.document;
    }
  }

  static async getDom() {
    if (typeof window !== "undefined") {
      return document;
    } else {
      const { JSDOM } = await import('jsdom');
      const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
      return dom.window.document;
    }
  }

  static detectMimeType(input) {
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
    const type = this.contentType || this.contentTypeByExtension[this.extension];
    if (type) return type;

    return Helpers.detectMimeType(this.text);
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


// Import all command functions
import setDebug from "./commands/setDebug.js";
import noOp from "./commands/noOp.js";
import absolutize from "./commands/absolutize.js";
import jsonataQuery from "./commands/jsonata.js";
import http from "./commands/http.js";
import addCss from "./commands/addCss.js";
import extract from "./commands/extract.js";
import wrap from "./commands/wrap.js";
import templateJson from "./commands/templateJson.js";
import newLines from "./commands/newLines.js";
import makeTable from "./commands/makeTable.js";
import prepend from "./commands/prepend.js";
import append from "./commands/append.js";
import remove from "./commands/remove.js";
import removeLines from "./commands/removeLines.js";
import wrapLines from "./commands/wrapLines.js";
import setAttribute from "./commands/setAttribute.js";
import csvToJson from "./commands/csvToJson.js";
import htmlTableToJson from "./commands/htmlTableToJson.js";
import raiseEvent from "./commands/raiseEvent.js";
import readFrom from "./commands/readFrom.js";
import writeTo from "./commands/writeTo.js";
import removeBefore from "./commands/removeBefore.js";
import takeBefore from "./commands/takeBefore.js";
import trim from "./commands/trim.js";

import debugTemplate from "./templates/debug.liquid";

import { Liquid } from "liquidjs";
import { WorkingData } from "./WorkingData.js";

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

  static onLog = null; // Optional callback for log messages: (args) => void
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
    Pipeline.staticCommandLib.set("http", http);
    Pipeline.staticCommandLib.set("add-css", addCss);
    Pipeline.staticCommandLib.set("jsonata", jsonataQuery);
    Pipeline.staticCommandLib.set("set-debug", setDebug);
    Pipeline.staticCommandLib.set("no-op", noOp);
    Pipeline.staticCommandLib.set("prepend", prepend);
    Pipeline.staticCommandLib.set("append", append);
    Pipeline.staticCommandLib.set("remove", remove);
    Pipeline.staticCommandLib.set("remove-lines", removeLines);
    Pipeline.staticCommandLib.set("remove-before", removeBefore);
    Pipeline.staticCommandLib.set("take-before", takeBefore);
    Pipeline.staticCommandLib.set("trim", trim);
    Pipeline.staticCommandLib.set("wrap-lines", wrapLines);
    Pipeline.staticCommandLib.set("set-attribute", setAttribute);
    Pipeline.staticCommandLib.set("csv-to-json", csvToJson);
    Pipeline.staticCommandLib.set("table-to-json", htmlTableToJson);
    Pipeline.staticCommandLib.set("raise-event", raiseEvent);
    Pipeline.staticCommandLib.set("read-from", readFrom);
    Pipeline.staticCommandLib.set("write-to", writeTo);
  }

  //============================================================================
  // CONSTRUCTOR
  //============================================================================

  constructor(commandSet) {
    if (!commandSet || typeof commandSet !== "object") {
      throw new Error("Pipeline constructor requires a commandSet object");
    }
    if (!Array.isArray(commandSet.commands)) {
      throw new Error("Pipeline constructor requires commandSet.commands to be an array");
    }

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
    const func = this.getCommandFunction(command.name);
    if (!func) {
      errors.push(`Unknown command: "${command.name}"`);
      return errors;
    }

    // Check each provided argument against the command's arg definitions
    if (!Array.isArray(command.arguments)) {
      errors.push(`Command "${command.name}": arguments must be an array`);
      return errors;
    }

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

        if (value == null) continue;

        // Is this a variable reference?
        const variableRegex = /^{\w+}$/; // This is a regex because some Liquid templates might start and end with a brace
        if (typeof value === "string" && variableRegex.test(value)) {
          const varName = value.slice(1, -1).trim();
          if (this.pipeline.vars.has(varName)) {
            value = this.pipeline.vars.get(varName);
          } else {
            this.pipeline.log(`Warning: Variable "{${varName}}" referenced in command "${this.name}" but not found in pipeline vars`);
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

    // If working is a string, convert it to a WorkingData object
    if (typeof working === "string") {
      working = new WorkingData(working);
    }

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

    // Validate command arrays before execution
    if (!Array.isArray(this.headCommands) || !Array.isArray(this.commands) || !Array.isArray(this.tailCommands)) {
      throw new Error("Pipeline execution failed: command arrays are not properly initialized");
    }

    // Execute all commands in order
    for (let command of [
      ...this.headCommands,
      ...this.commands,
      ...this.tailCommands,
    ]) {
      this.wrapCommand(command, this);

      this.log(`Executing: ${command.name}`, command.arguments);

      // Initialize command history tracking
      const history = {};
      history.command = {
        name: command.name,
        arguments: command.arguments,
      };
      history.input = working.text;

      // Check for unknown commands before execution
      if (!this.getCommandFunction(command.name)) {
        const errorMsg = `Unknown command: "${command.name}". Available commands: ${Array.from(Pipeline.staticCommandLib.keys()).join(", ")}`;
        this.log(errorMsg);
        continue; // Skip unknown commands and continue to the next one
      }

      const validateErrors = this.validateCommand(command);
      if (validateErrors.length > 0) {
        this.log(`Validation failed for command ${command.name}:`, validateErrors);
        working.abort = true;
        return working;
      }

      const func = this.getCommandFunction(command.name);
      if (working.text === null || working.text === undefined) {
        throw new Error(`Command "${command.name}" execution failed: working text is null or undefined`);
      }
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
      let commandResult;
      try {
        const start = performance.now();
        commandResult = await func(working, command, this);
        const duration = performance.now() - start;

        history.duration = duration;

        this.emit("textflow:command-finished", {
          working,
          command,
          pipeline: this,
        });

        history.delta = working.text.length - beforeLength;
        history.output = working.text;
      } catch (ex) {
        const errorMessage = ex instanceof Error ? ex.message : String(ex);
        this.log(`Error in command "${command.name}": ${errorMessage}`);
        if (this.debug && ex instanceof Error && ex.stack) {
          this.log(`Stack trace: ${ex.stack}`);
        }
        working.abort = true;
      }

      // Validate command result type (must be string or null/undefined)
      // This is outside the try-catch so validation errors propagate up
      if (commandResult != null) {
        if (typeof commandResult !== "string") {
          throw new Error(`Command "${command.name}" returned ${typeof commandResult} instead of a string`);
        }

        if(command.target) {
          working.writeTo(command.target, commandResult);
        } else {
          working.text = commandResult;
        }
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
    try {
      if (typeof document === "undefined") return true; // We're not in a browser environment, so just return true to allow all events

      const event = new CustomEvent(type, {
        detail,
        cancelable: cancelable || false,
      });

      const eventResult = document.dispatchEvent(event);
      return eventResult;
    } catch (error) {
      this.log(`Warning: Error during event emission for "${type}": ${error.message}`);
      return true; // Return true to allow pipeline to continue
    }
  }

  /**
   * Log messages if debug mode is enabled
   */
  log(...args) {
    if (this.debug) console.log(...args);
    if (Pipeline.onLog) Pipeline.onLog(args);
  }

  /**
   * Generate debug data for the pipeline execution
   */
  static async getDebugData(working) {
    try {
      if (typeof document === "undefined") {
        throw new Error("Debug data generation requires a browser environment with document object");
      }

      const engine = new Liquid();
      engine.registerFilter("commas", function (value) {
        return Intl.NumberFormat("en-US").format(value);
      });

      const debugHtml = await engine.parseAndRenderSync(debugTemplate, {
        history: working.history,
      });

      const debugElement = document.createElement("debug-data");
      if (!debugElement.attachShadow) {
        throw new Error("Failed to create shadow DOM: element does not support attachShadow");
      }

      const shadowRoot = debugElement.attachShadow({ mode: "open" });
      shadowRoot.innerHTML = debugHtml;
      return debugElement;
    } catch (error) {
      console.error("Debug data generation failed:", error.message);
      throw error;
    }
  }
}

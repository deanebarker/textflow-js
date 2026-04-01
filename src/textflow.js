//==============================================================================
// IMPORTS
//==============================================================================

import { Pipeline } from "./Pipeline.js";
import { WorkingData } from "./WorkingData.js";

//==============================================================================
// PUBLIC API FUNCTIONS
//==============================================================================

/**
 * Execute a pipeline of commands on input data
 *
 * Supports signatures for backward compatibility:
 * - New: executePipeline(input, commandSet, vars)
 * - Transition: executePipeline(input, ignored, commandSet, vars)
 * - Old: executePipeline(input, initialContentType, source, commandSet, vars)
 */
export async function executePipeline(input, arg2, arg3, arg4, arg5) {
  // BACKWARDS COMPATIBILITY: This function supports multiple signatures
  //
  // New signature (3 args): executePipeline(input, commandSet, vars)
  // Transition signature (4 args): executePipeline(input, ignored, commandSet, vars)
  // Old signature (5 args): executePipeline(input, initialContentType, source, commandSet, vars)
  //
  // The initialContentType and source parameters were removed when we removed all content-type tracking and the source property.
  // To maintain backward compatibility, we detect which signature is being called by checking arguments.length:
  // - If 5 args: caller used old signature; initialContentType (arg 2) and source (arg 3) are ignored
  // - If 4 args: transition period; arg 2 is ignored, arg 3 is commandSet
  // - If 3 args: caller used new signature; args map directly to their parameters

  let commandSet, actualVars;

  if (arguments.length === 5) {
    // Old signature: arguments are (input, initialContentType, source, commandSet, vars)
    commandSet = arg4;
    actualVars = arg5;
  } else if (arguments.length === 4) {
    // Transition signature: arguments are (input, ignored, commandSet, vars)
    commandSet = arg3;
    actualVars = arg4;
  } else if (arguments.length === 3) {
    // New signature: arguments are (input, commandSet, vars)
    commandSet = arg2;
    actualVars = arg3;
  } else {
    throw new Error(
      `executePipeline expects 3, 4, or 5 arguments, got ${arguments.length}`
    );
  }

  const working = new WorkingData(input);
  const p = new Pipeline(commandSet);

  // Both the working data and the pipe get the same vars initially. However, the working vars can vary over the course of execution, while the pipeline.vars is really just a reference to the same Map for use in commands that need access to the vars but don't have access to the working object. This is a bit awkward, but it allows us to keep the command function signatures consistent with (working, command, pipeline) without needing to pass vars separately.
  // The pipeline vars are what can be injected into command arguments using the {varName} syntax, so they need to be set before we execute any commands. The working.vars is what commands can read and modify during execution.
  p.vars = actualVars ?? new Map();
  working.vars = actualVars ?? new Map();
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
// EXPORTS
//==============================================================================

export { Pipeline, WorkingData };



import { Pipeline, WorkingData } from "../src/textflow.js";

export async function execute(commands, text) {
  let working = new WorkingData(text);
  commands = commands.map((c) => convertCommand(c));
  const p = new Pipeline({ commands });
  p.debug = true;
  working = await p.execute(working);
  if (working.abort) {
    throw new Error("Pipeline execution aborted due to validation failure.");
  }
  return working;
}

function convertCommand(command) {
  try {
    const converted = {
      name: command.name,
      arguments: Object.keys(command)
        .filter((k) => k !== "name" && k !== "target")
        .map((k) => ({ key: k, value: command[k] })),
    };

    // target is not an argument, it's a direct property on the command object
    if (command.target !== undefined) {
      converted.target = command.target;
    }

    return converted;
  } catch (e) {
    console.error("Error converting command:", e);
    throw e;
  }
}


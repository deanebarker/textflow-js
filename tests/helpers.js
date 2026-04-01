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
    return {
      name: command.name,
      arguments: Object.keys(command)
        .filter((k) => k !== "name")
        .map((k) => ({ key: k, value: command[k] })),
    };
  } catch (e) {
    console.error("Error converting command:", e);
    throw e;
  }
}


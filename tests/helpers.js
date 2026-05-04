import { Pipeline, WorkingData } from "../src/textflow.js";

export async function execute(commands, text) {
  let working = new WorkingData(text);
  commands = commands.map((c) => convertCommand(c));
  const p = new Pipeline({ commands });
  p.debug = true;
  p.onLog = (message) => {
    console.log("Pipeline log:", message);
  }
  p.onError = (message) => {
    console.error("Pipeline error:", message);
  }

  try
  {
    working = await p.execute(working);
  }
  catch(e) {
    console.error("Error during pipeline execution:", e);
    throw e;
  }
  
  if (working.abort) {
    throw new Error(p.log);
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


function raiseEvent(working, command, pipeline) {
  const event = command.getArg("event");

  if (!event) {
    throw new Error("The 'event' argument is required for raiseEvent command");
  }

  // Gather all available data to pass in the event detail
  const eventDetail = {
    working: {
      text: working.text,
      source: working.source,
      extension: working.extension,
      abort: working.abort,
      styleBlocks: working.styleBlocks,
      container: working.container,
      history: working.history,
    },
    pipeline: {
      debug: pipeline.debug,
      vars: Object.fromEntries(pipeline.vars),
    },
    timestamp: new Date().toISOString(),
  };

  // Raise the custom event on the document
  if (typeof document !== "undefined") {
    const customEvent = new CustomEvent(event, {
      detail: eventDetail,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(customEvent);
  }

  // Return the working object unchanged
  return working;
}

// Meta
raiseEvent.title = "Raise Event";
raiseEvent.description =
  "Raise a JavaScript CustomEvent on the document object with pipeline context data for debugging or triggering external behavior.";
raiseEvent.args = [
  {
    name: "event",
    type: "string",
    description: "Name of the custom event to raise (required)",
  },
];

export default raiseEvent;

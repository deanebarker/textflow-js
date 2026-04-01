//==============================================================================
// WORKING DATA CLASS - Represents data flowing through the pipeline
//==============================================================================

export class WorkingData {
  //============================================================================
  // CONSTRUCTOR
  //============================================================================

  constructor(text) {
    this.text = text;
    this.abort = false;
    this.history = [];
    this.vars = new Map();
  }

  writeTo(key, value) {
    if (!key) {
      throw new Error("writeTo requires a key");
    }

    this.vars.set(key, value);
  }
}

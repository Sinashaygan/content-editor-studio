import type { SaveMode } from "./types";

export class SaveQueue {
  private inFlight = false;
  private queuedManualSave = false;

  get isInFlight() {
    return this.inFlight;
  }

  request(mode: SaveMode): boolean {
    if (this.inFlight) {
      if (mode === "manual") this.queuedManualSave = true;
      return false;
    }
    this.inFlight = true;
    return true;
  }

  finish(): SaveMode | null {
    this.inFlight = false;
    if (!this.queuedManualSave) return null;
    this.queuedManualSave = false;
    this.inFlight = true;
    return "manual";
  }

  clear() {
    this.inFlight = false;
    this.queuedManualSave = false;
  }
}

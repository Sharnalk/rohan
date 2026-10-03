import { getElement } from "./dom";

export type ViewState = "idle" | "loading" | "done" | "error";

const dropzone = getElement("dropzone");
const fileRow = getElement("file-row");
const fileName = getElement("file-name");
const filePages = getElement("file-pages");
const statusElement = getElement("status");
const statusText = getElement("status-text");
const skeleton = getElement("skeleton");
const result = getElement("result");
const resultMeta = getElement("result-meta");
const output = getElement("output");

/** Updates only the status line (icon, color and message). */
export function setStatus(state: ViewState, message: string): void {
  statusElement.dataset.state = state;
  statusText.textContent = message;
}

/** Shows the blocks matching the current step, hides the others. */
export function showState(state: ViewState, message = ""): void {
  dropzone.hidden = state !== "idle";
  fileRow.hidden = state === "idle";
  skeleton.hidden = state !== "loading";
  result.hidden = state !== "done";
  setStatus(state, message);
}

/** Shows the chosen file name; its page count is not known yet. */
export function showFile(name: string): void {
  fileName.textContent = name;
  filePages.textContent = "";
}

export function showResult(content: string, pageCount: number): void {
  output.textContent = content;
  filePages.textContent = plural(pageCount, "PAGE");
  resultMeta.textContent = `${plural(pageCount, "PAGE")} · ${plural(content.length, "CHARACTER")}`;
  showState("done", "Done.");
}

function plural(count: number, word: string): string {
  return `${count.toLocaleString("en-US")} ${word}${count === 1 ? "" : "S"}`;
}

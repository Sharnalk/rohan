import "./styles.css";
import { toText } from "../core/to-text";
import { extractItems } from "../pdf/extract-items";
import { setupThemeToggle } from "./theme";

type ViewState = "idle" | "loading" | "done" | "error";

const COPIED_FEEDBACK_MS = 2000;

/** The page is ours: a missing element is a bug, so we fail loudly. */
function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element #${id}`);
  return element as T;
}

const pdfInput = getElement<HTMLInputElement>("pdf-input");
const dropzone = getElement("dropzone");
const fileRow = getElement("file-row");
const fileName = getElement("file-name");
const filePages = getElement("file-pages");
const changeFileButton = getElement<HTMLButtonElement>("change-file");
const statusElement = getElement("status");
const statusText = getElement("status-text");
const skeleton = getElement("skeleton");
const result = getElement("result");
const resultMeta = getElement("result-meta");
const copyButton = getElement<HTMLButtonElement>("copy-button");
const copyLabel = getElement("copy-label");
const downloadButton = getElement<HTMLButtonElement>("download-button");
const output = getElement("output");

let extractedText = "";
let downloadName = "";
let copiedTimer: number | undefined;

setupThemeToggle(getElement<HTMLButtonElement>("theme-toggle"));

/** Updates only the status line (icon, color and message). */
function setStatus(state: ViewState, message: string): void {
  statusElement.dataset.state = state;
  statusText.textContent = message;
}

/** Shows the blocks matching the current step, hides the others. */
function showState(state: ViewState, message = ""): void {
  dropzone.hidden = state !== "idle";
  fileRow.hidden = state === "idle";
  skeleton.hidden = state !== "loading";
  result.hidden = state !== "done";
  setStatus(state, message);
}

function plural(count: number, word: string): string {
  return `${count.toLocaleString("en-US")} ${word}${count === 1 ? "" : "S"}`;
}

async function convert(file: File): Promise<void> {
  fileName.textContent = file.name;
  filePages.textContent = "";

  if (file.type !== "application/pdf") {
    showState("error", "Failed: only PDF files are supported.");
    return;
  }

  showState("loading", "Converting…");
  try {
    const pages = await extractItems(await file.arrayBuffer());
    extractedText = toText(pages);
    downloadName = file.name.replace(/\.pdf$/i, "") + ".txt";

    output.textContent = extractedText;
    filePages.textContent = plural(pages.length, "PAGE");
    resultMeta.textContent = `${plural(pages.length, "PAGE")} · ${plural(extractedText.length, "CHARACTER")}`;
    showState("done", "Done.");
  } catch (error) {
    showState("error", `Failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function download(content: string, name: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

// ---------- Choosing a file ----------

pdfInput.addEventListener("change", () => {
  const file = pdfInput.files?.[0];
  // Reset so that choosing the same file again still fires "change".
  pdfInput.value = "";
  if (file) void convert(file);
});

changeFileButton.addEventListener("click", () => pdfInput.click());

// ---------- Drag and drop ----------

dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.classList.add("is-dragging");
});

dropzone.addEventListener("dragleave", () => dropzone.classList.remove("is-dragging"));

dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropzone.classList.remove("is-dragging");
  const file = event.dataTransfer?.files[0];
  if (file) void convert(file);
});

// A file dropped outside the zone would otherwise be opened by the browser.
window.addEventListener("dragover", (event) => event.preventDefault());
window.addEventListener("drop", (event) => event.preventDefault());

// ---------- Result actions ----------

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(extractedText);
  } catch {
    // Keep the result visible: only the status line reports the problem.
    setStatus("error", "Failed: could not copy to the clipboard.");
    return;
  }
  setStatus("done", "Copied to the clipboard.");
  copyButton.classList.add("is-copied");
  copyLabel.textContent = "Copied";
  clearTimeout(copiedTimer);
  copiedTimer = window.setTimeout(() => {
    copyButton.classList.remove("is-copied");
    copyLabel.textContent = "Copy";
  }, COPIED_FEEDBACK_MS);
});

downloadButton.addEventListener("click", () => download(extractedText, downloadName));

showState("idle");

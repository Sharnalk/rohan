import "./styles.css";
import { convertPages, type Conversion } from "../core/convert-pages";
import { extractItems } from "../pdf/pdfjs-extract-items";
import { getElement } from "./dom";
import { download } from "./download";
import { EXTENSIONS, FORMATS } from "./format-switch";

/** Optional in the manifest: asked once, the first time the popup opens on a PDF. */
const ALL_SITES = { origins: ["<all_urls>"] };

const content = getElement("content");
const fileName = getElement("file-name");
const permission = getElement("permission");
const allowButton = getElement<HTMLButtonElement>("allow-button");
const statusElement = getElement("status");
const statusText = getElement("status-text");
const actions = getElement<HTMLFieldSetElement>("actions");

let conversion: Conversion = { text: "", markdown: "" };
let baseName = "";

function setStatus(state: "loading" | "done" | "error", message: string): void {
  statusElement.dataset.state = state;
  statusText.textContent = message;
}

async function openConverter(): Promise<void> {
  await chrome.tabs.create({ url: "converter.html" });
  window.close();
}

/** Last segment of the path, decoded when possible: "My%20file.pdf" → "My file.pdf". */
function lastSegment(url: URL): string {
  const segment = url.pathname.split("/").at(-1) ?? "";
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Downloads the PDF of the tab again (with the site cookies, for PDFs behind a login) and converts it. */
async function convert(url: string): Promise<void> {
  setStatus("loading", "Converting…");
  try {
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) throw new Error(`could not download the PDF (HTTP ${response.status}).`);
    const pages = await extractItems(await response.arrayBuffer());
    conversion = convertPages(pages);
    actions.disabled = false;
    setStatus("done", `Ready · ${pages.length} page${pages.length === 1 ? "" : "s"}.`);
  } catch (error) {
    setStatus("error", `Failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function copy(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    setStatus("done", "Copied to the clipboard.");
  } catch {
    setStatus("error", "Failed: could not copy to the clipboard.");
  }
}

for (const format of FORMATS) {
  getElement(`copy-${format}`).addEventListener("click", () => copy(conversion[format]));
  getElement(`download-${format}`).addEventListener("click", () => {
    download(conversion[format], `${baseName}.${EXTENSIONS[format]}`);
  });
}
getElement("open-converter").addEventListener("click", openConverter);

// activeTab gives the URL of the tab the popup was opened on.
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
const url = tab?.url ? new URL(tab.url) : undefined;

if (url && /\.pdf$/i.test(url.pathname)) {
  baseName = lastSegment(url).replace(/\.pdf$/i, "");
  fileName.textContent = `${baseName}.pdf`;
  content.hidden = false;

  allowButton.addEventListener("click", async () => {
    // Firefox closes the popup while it asks: once access is given, the next opening converts.
    if (!(await chrome.permissions.request(ALL_SITES))) return;
    permission.hidden = true;
    await convert(url.href);
  });

  if (await chrome.permissions.contains(ALL_SITES)) await convert(url.href);
  else permission.hidden = false;
} else {
  // Not a PDF: open the converter page, as the toolbar button did before the popup.
  await openConverter();
}

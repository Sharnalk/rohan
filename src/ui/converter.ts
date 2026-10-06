import "./styles.css";
import { convertPages, type Conversion } from "../core/convert-pages";
import { extractItems } from "../pdf/pdfjs-extract-items";
import { getElement } from "./dom";
import { download } from "./download";
import { setupFileInputs } from "./file-inputs";
import { EXTENSIONS, setupFormatSwitch, type OutputFormat } from "./format-switch";
import { copyWithFeedback } from "./result-actions";
import { setupThemeToggle } from "./theme";
import {
  addFileRow,
  hidePreview,
  setStatus,
  showPreview,
  showRowDone,
  showRowError,
  showSelection,
  type FileRow,
} from "./views";

/** A file of the list. `conversion` is set once the PDF is converted. */
interface Entry {
  baseName: string;
  row: FileRow;
  pageCount: number;
  conversion?: Conversion;
}

let entries: Entry[] = [];
let previewed: Entry | undefined;
let format: OutputFormat = "text";
/** The PDFs are converted one after the other, in the order they were added. */
let queue = Promise.resolve();

function contentOf(entry: Entry): string {
  return entry.conversion?.[format] ?? "";
}

function converted(): Entry[] {
  return entries.filter((entry) => entry.conversion);
}

function selected(): Entry[] {
  return converted().filter((entry) => entry.row.check.checked);
}

function updateSelection(): void {
  showSelection(selected().length, converted().length, entries.length);
}

function preview(entry: Entry | undefined): void {
  previewed = entry;
  for (const other of entries) other.row.item.classList.toggle("is-previewed", other === entry);
  if (entry) showPreview(`${entry.baseName}.pdf`, contentOf(entry), entry.pageCount);
  else hidePreview();
}

async function convert(entry: Entry, file: File): Promise<void> {
  setStatus("loading", `Converting ${file.name}…`);
  try {
    const pages = await extractItems(await file.arrayBuffer());
    entry.conversion = convertPages(pages);
    entry.pageCount = pages.length;
    showRowDone(entry.row, pages.length);
    setStatus("done", "Done.");
  } catch (error) {
    showRowError(entry.row, "FAILED");
    setStatus("error", `Failed: ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Removed while it was converting: nothing to show.
  if (!entries.includes(entry)) return;
  if (!previewed && entry.conversion) preview(entry);
  updateSelection();
}

function remove(entry: Entry): void {
  entries = entries.filter((other) => other !== entry);
  entry.row.item.remove();
  if (previewed === entry) preview(converted()[0]);
  updateSelection();
}

function addFile(file: File): void {
  const entry: Entry = { baseName: file.name.replace(/\.pdf$/i, ""), row: addFileRow(file.name), pageCount: 0 };
  const { row } = entry;
  entries.push(entry);

  row.open.addEventListener("click", () => preview(entry));
  row.check.addEventListener("change", updateSelection);
  row.copy.addEventListener("click", () => copyWithFeedback(row.copy, contentOf(entry)));
  row.download.addEventListener("click", () => download(contentOf(entry), `${entry.baseName}.${EXTENSIONS[format]}`));
  row.remove.addEventListener("click", () => remove(entry));

  if (file.type === "application/pdf") queue = queue.then(() => convert(entry, file));
  else showRowError(row, "NOT A PDF");
}

setupThemeToggle(getElement<HTMLButtonElement>("theme-toggle"));

setupFileInputs((files) => {
  for (const file of files) addFile(file);
  updateSelection();
});

setupFormatSwitch((chosen) => {
  format = chosen;
  preview(previewed);
});

const selectAll = getElement<HTMLInputElement>("select-all");
selectAll.addEventListener("change", () => {
  for (const entry of converted()) entry.row.check.checked = selectAll.checked;
  updateSelection();
});

// The selected files are copied together, each one under its name, in the order of the list.
const copySelected = getElement<HTMLButtonElement>("copy-selected");
copySelected.addEventListener("click", () => {
  const content = selected()
    .map((entry) => `===== ${entry.baseName}.pdf =====\n\n${contentOf(entry)}`)
    .join("\n\n");
  copyWithFeedback(copySelected, content);
});

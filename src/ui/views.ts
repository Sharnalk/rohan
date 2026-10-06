import { getElement } from "./dom";

export type ViewState = "loading" | "done" | "error";

const dropzone = getElement("dropzone");
const statusElement = getElement("status");
const statusText = getElement("status-text");
const files = getElement("files");
const filesMeta = getElement("files-meta");
const selectAll = getElement<HTMLInputElement>("select-all");
const copySelected = getElement<HTMLButtonElement>("copy-selected");
const fileList = getElement("file-list");
const fileTemplate = getElement<HTMLTemplateElement>("file-template");
const preview = getElement("preview");
const previewName = getElement("preview-name");
const previewMeta = getElement("preview-meta");
const output = getElement("output");

/** The parts of a file row that converter.ts listens to or updates. */
export interface FileRow {
  item: HTMLElement;
  check: HTMLInputElement;
  open: HTMLButtonElement;
  meta: HTMLElement;
  copy: HTMLButtonElement;
  download: HTMLButtonElement;
  remove: HTMLButtonElement;
}

/** Updates only the status line (icon, color and message). */
export function setStatus(state: ViewState, message: string): void {
  statusElement.dataset.state = state;
  statusText.textContent = message;
}

/** Adds a row at the end of the list, for a file not converted yet. */
export function addFileRow(name: string): FileRow {
  const item = fileTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
  const part = <T extends HTMLElement>(className: string) => item.querySelector(`.${className}`) as T;
  part("file-name").textContent = name;
  const row: FileRow = {
    item,
    check: part("file-check"),
    open: part("file-open"),
    meta: part("file-meta"),
    copy: part("file-copy"),
    download: part("file-download"),
    remove: part("file-remove"),
  };
  row.meta.textContent = "CONVERTING…";
  fileList.append(item);
  return row;
}

/** A converted file: page count shown, actions enabled, selected by default. */
export function showRowDone(row: FileRow, pageCount: number): void {
  row.meta.textContent = plural(pageCount, "PAGE");
  for (const control of [row.check, row.open, row.copy, row.download]) control.disabled = false;
  row.check.checked = true;
}

/** A file that cannot be converted: only "Remove" stays available. */
export function showRowError(row: FileRow, label: string): void {
  row.item.dataset.state = "error";
  row.meta.textContent = label;
}

/** Selection summary, "Select all" box and "Copy selected" button. The list is hidden when empty. */
export function showSelection(selected: number, converted: number, total: number): void {
  files.hidden = total === 0;
  dropzone.classList.toggle("is-compact", total > 0);
  filesMeta.textContent = selected > 0 ? `${selected} OF ${plural(total, "FILE")} SELECTED` : plural(total, "FILE");
  selectAll.disabled = converted === 0;
  selectAll.checked = converted > 0 && selected === converted;
  selectAll.indeterminate = selected > 0 && selected < converted;
  copySelected.disabled = selected === 0;
}

export function showPreview(name: string, content: string, pageCount: number): void {
  previewName.textContent = name;
  previewMeta.textContent = `${plural(pageCount, "PAGE")} · ${plural(content.length, "CHARACTER")}`;
  output.textContent = content;
  preview.hidden = false;
}

export function hidePreview(): void {
  preview.hidden = true;
}

function plural(count: number, word: string): string {
  return `${count.toLocaleString("en-US")} ${word}${count === 1 ? "" : "S"}`;
}

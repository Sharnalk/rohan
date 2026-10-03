import { getElement } from "./dom";

/**
 * Wires every way of choosing a PDF (file picker, "Change file" button, drag and drop)
 * to a single callback. This module does not know what happens to the file next.
 */
export function setupFileInputs(onFile: (file: File) => void): void {
  const pdfInput = getElement<HTMLInputElement>("pdf-input");
  const dropzone = getElement("dropzone");
  const changeFileButton = getElement<HTMLButtonElement>("change-file");

  pdfInput.addEventListener("change", () => {
    const file = pdfInput.files?.[0];
    // Reset so that choosing the same file again still fires "change".
    pdfInput.value = "";
    if (file) onFile(file);
  });

  changeFileButton.addEventListener("click", () => pdfInput.click());

  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("is-dragging");
  });

  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("is-dragging"));

  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-dragging");
    const file = event.dataTransfer?.files[0];
    if (file) onFile(file);
  });

  // A file dropped outside the zone would otherwise be opened by the browser.
  window.addEventListener("dragover", (event) => event.preventDefault());
  window.addEventListener("drop", (event) => event.preventDefault());
}

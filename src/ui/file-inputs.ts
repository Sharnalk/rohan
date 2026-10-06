import { getElement } from "./dom";

/**
 * Wires every way of choosing PDFs (file picker, drag and drop) to a single callback.
 * This module does not know what happens to the files next.
 */
export function setupFileInputs(onFiles: (files: File[]) => void): void {
  const pdfInput = getElement<HTMLInputElement>("pdf-input");
  const dropzone = getElement("dropzone");

  pdfInput.addEventListener("change", () => {
    const files = [...(pdfInput.files ?? [])];
    // Reset so that choosing the same files again still fires "change".
    pdfInput.value = "";
    if (files.length > 0) onFiles(files);
  });

  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("is-dragging");
  });

  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("is-dragging"));

  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-dragging");
    const files = [...(event.dataTransfer?.files ?? [])];
    if (files.length > 0) onFiles(files);
  });

  // A file dropped outside the zone would otherwise be opened by the browser.
  window.addEventListener("dragover", (event) => event.preventDefault());
  window.addEventListener("drop", (event) => event.preventDefault());
}

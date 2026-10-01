import { toText } from "../core/to-text";
import { extractItems } from "../pdf/extract-items";

const pdfInput = document.querySelector<HTMLInputElement>("#pdf-input");
const statusElement = document.querySelector("#status");
const outputElement = document.querySelector("#output");

if (statusElement) statusElement.textContent = "Prêt.";

pdfInput?.addEventListener("change", async () => {
  const file = pdfInput.files?.[0];
  if (!file || !statusElement || !outputElement) return;

  try {
    statusElement.textContent = "Conversion…";
    const data = await file.arrayBuffer();
    const pages = await extractItems(data);
    outputElement.textContent = toText(pages);
    statusElement.textContent = "Terminé.";
  } catch (error) {
    statusElement.textContent = `Échec : ${String(error)}`;
  }
});

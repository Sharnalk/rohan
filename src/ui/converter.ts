import "./styles.css";
import { toText } from "../core/render/to-text";
import { extractItems } from "../pdf/pdfjs-extract-items";
import { getElement } from "./dom";
import { setupFileInputs } from "./file-inputs";
import { setupResultActions, type ConversionResult } from "./result-actions";
import { setupThemeToggle } from "./theme";
import { showFile, showResult, showState } from "./views";

let currentResult: ConversionResult = { content: "", fileName: "" };

async function convert(file: File): Promise<void> {
  showFile(file.name);

  if (file.type !== "application/pdf") {
    showState("error", "Failed: only PDF files are supported.");
    return;
  }

  showState("loading", "Converting…");
  try {
    const pages = await extractItems(await file.arrayBuffer());
    const content = toText(pages);
    currentResult = { content, fileName: file.name.replace(/\.pdf$/i, "") + ".txt" };
    showResult(content, pages.length);
  } catch (error) {
    showState("error", `Failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

setupThemeToggle(getElement<HTMLButtonElement>("theme-toggle"));
setupFileInputs(convert);
setupResultActions(() => currentResult);
showState("idle");

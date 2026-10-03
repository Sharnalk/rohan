import "./styles.css";
import { convertPages, type Conversion } from "../core/convert-pages";
import { extractItems } from "../pdf/pdfjs-extract-items";
import { getElement } from "./dom";
import { setupFileInputs } from "./file-inputs";
import { setupFormatSwitch, type OutputFormat } from "./format-switch";
import { setupResultActions, type ConversionResult } from "./result-actions";
import { setupThemeToggle } from "./theme";
import { showFile, showResult, showState } from "./views";

const EXTENSIONS: Record<OutputFormat, string> = { text: "txt", markdown: "md" };

let conversion: Conversion = { text: "", markdown: "" };
let pageCount = 0;
let baseName = "";
let format: OutputFormat = "text";

/** The content and file name for the format currently selected. */
function currentResult(): ConversionResult {
  return { content: conversion[format], fileName: `${baseName}.${EXTENSIONS[format]}` };
}

function showCurrentResult(): void {
  showResult(conversion[format], pageCount, EXTENSIONS[format]);
}

async function convert(file: File): Promise<void> {
  showFile(file.name);

  if (file.type !== "application/pdf") {
    showState("error", "Failed: only PDF files are supported.");
    return;
  }

  showState("loading", "Converting…");
  try {
    const pages = await extractItems(await file.arrayBuffer());
    conversion = convertPages(pages);
    pageCount = pages.length;
    baseName = file.name.replace(/\.pdf$/i, "");
    showCurrentResult();
  } catch (error) {
    showState("error", `Failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

setupThemeToggle(getElement<HTMLButtonElement>("theme-toggle"));
setupFileInputs(convert);
setupFormatSwitch((chosen) => {
  format = chosen;
  showCurrentResult();
});
setupResultActions(currentResult);
showState("idle");

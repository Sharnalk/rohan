import { getElement } from "./dom";

export type OutputFormat = "text" | "markdown";

export const FORMATS: OutputFormat[] = ["text", "markdown"];

export const EXTENSIONS: Record<OutputFormat, string> = { text: "txt", markdown: "md" };

/** Wires the Text / Markdown switch: marks the pressed button and reports the chosen format. */
export function setupFormatSwitch(onChange: (format: OutputFormat) => void): void {
  const buttons: Record<OutputFormat, HTMLButtonElement> = {
    text: getElement<HTMLButtonElement>("format-text"),
    markdown: getElement<HTMLButtonElement>("format-markdown"),
  };

  for (const format of FORMATS) {
    buttons[format].addEventListener("click", () => {
      for (const other of FORMATS) {
        buttons[other].setAttribute("aria-pressed", String(other === format));
      }
      onChange(format);
    });
  }
}

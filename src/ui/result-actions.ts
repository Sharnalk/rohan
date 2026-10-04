import { getElement } from "./dom";
import { download } from "./download";
import { setStatus } from "./views";

const COPIED_FEEDBACK_MS = 2000;

export interface ConversionResult {
  content: string;
  fileName: string;
}

/**
 * Wires the Copy and Download buttons. `getResult` is called on each click,
 * so the buttons always act on the latest conversion.
 */
export function setupResultActions(getResult: () => ConversionResult): void {
  const copyButton = getElement<HTMLButtonElement>("copy-button");
  const copyLabel = getElement("copy-label");
  const downloadButton = getElement<HTMLButtonElement>("download-button");
  let copiedTimer: number | undefined;

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(getResult().content);
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

  downloadButton.addEventListener("click", () => {
    const { content, fileName } = getResult();
    download(content, fileName);
  });
}

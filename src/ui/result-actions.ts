import { setStatus } from "./views";

const COPIED_FEEDBACK_MS = 2000;

/** Copies `text` to the clipboard; on success, `button` shows a check mark for a moment. */
export async function copyWithFeedback(button: HTMLButtonElement, text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Keep the result visible: only the status line reports the problem.
    setStatus("error", "Failed: could not copy to the clipboard.");
    return;
  }
  setStatus("done", "Copied to the clipboard.");
  button.classList.add("is-copied");
  setTimeout(() => button.classList.remove("is-copied"), COPIED_FEEDBACK_MS);
}

import type { TextItem } from "./types";

/**
 * Builds plain text from the items of each page.
 *
 * Shape of `pages`:
 * [
 *   [ { text: "Title", endsLine: true }, { text: "Body", endsLine: false } ], // page 1
 *   [ ... ],                                                                  // page 2
 * ]
 */
export function toText(pages: TextItem[][]): string {
  return pages
    .map((page) => page.map((item) => item.text + (item.endsLine ? "\n" : "")).join(""))
    .join("\n\n");
}

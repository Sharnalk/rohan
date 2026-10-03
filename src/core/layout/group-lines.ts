import type { Line, TextItem } from "../types";

/** Two items are on the same line when their y differ by less than this share of the font size. */
const SAME_LINE_RATIO = 0.5;

/** A horizontal gap wider than this share of the font size means a space between two words. */
const WORD_GAP_RATIO = 0.15;

/**
 * Groups the text items of one page into lines, read top to bottom and left to right.
 * Example: "1." and "Introduction" drawn at the same height become the line "1. Introduction".
 */
export function groupLines(items: TextItem[]): Line[] {
  // 1. Keep the items that carry text, from the top of the page down (in a PDF, y grows upwards).
  const sorted = items.filter((item) => item.text.trim() !== "").sort((a, b) => b.y - a.y);

  // 2. Put each item in the current group if it is at the same height, otherwise start a new group.
  const groups: TextItem[][] = [];
  for (const item of sorted) {
    const current = groups.at(-1);
    const reference = current?.[0];
    if (current && reference && isSameLine(reference, item)) {
      current.push(item);
    } else {
      groups.push([item]);
    }
  }

  // 3. Turn each group into a line.
  return groups.map(toLine);
}

/** Same line = same height (y), whatever the horizontal position. */
function isSameLine(reference: TextItem, item: TextItem): boolean {
  return Math.abs(reference.y - item.y) < reference.fontSize * SAME_LINE_RATIO;
}

function toLine(group: TextItem[]): Line {
  // Read the items from left to right, adding a space where there is a visible gap.
  const items = group.sort((a, b) => a.x - b.x);
  let text = "";
  let previous: TextItem | undefined;
  for (const item of items) {
    if (previous && needsSpace(previous, item)) text += " ";
    text += item.text;
    previous = item;
  }

  return {
    text: text.replace(/ {2,}/g, " ").trim(),
    y: Math.max(...items.map((item) => item.y)),
    fontSize: Math.max(...items.map((item) => item.fontSize)),
  };
}

function needsSpace(previous: TextItem, next: TextItem): boolean {
  if (previous.text.endsWith(" ") || next.text.startsWith(" ")) return false;
  const gap = next.x - (previous.x + previous.width);
  return gap > Math.max(previous.fontSize, next.fontSize) * WORD_GAP_RATIO;
}

import type { Block, Line } from "../types";

/** A line at least this much bigger than the body text is a heading. */
const HEADING_SIZE_RATIO = 1.15;

/** Markdown has 6 heading levels, but font sizes rarely carry more than 3. */
const MAX_HEADING_LEVEL = 3;

/** Two lines further apart than this many usual line gaps belong to two paragraphs. */
const PARAGRAPH_GAP_RATIO = 1.4;

/** A title wraps onto the next line if that line is closer than this many times its font size. */
const HEADING_WRAP_RATIO = 2;

/** A bullet ("•", "-"…) or a number ("1.", "2)") followed by a space. */
const LIST_MARKER = /^([•▪◦‣●○■□*\-–]|\d{1,2}[.)])\s+/;

/**
 * Turns the lines of every page into headings, paragraphs and list items.
 * The whole document is needed first, because "big" and "far apart" only make sense
 * compared with the rest of it.
 */
export function groupBlocks(pages: Line[][]): Block[] {
  const lines = pages.flat();
  if (lines.length === 0) return [];

  // 1. Measure the document.
  const bodySize = findBodySize(lines);
  const lineGap = findLineGap(lines, bodySize);
  const headingSizes = findHeadingSizes(pages, bodySize);

  // 2. Read the lines in order and build the blocks.
  const blocks: Block[] = [];
  for (const page of pages) {
    let previous: Line | undefined;

    for (const line of page) {
      const size = roundSize(line.fontSize);
      // The first line of a page always starts a new block.
      const gap = previous ? previous.y - line.y : Infinity;
      const previousSize = previous ? roundSize(previous.fontSize) : 0;
      previous = line;
      const last = blocks.at(-1);

      // Heading: bigger than the body text.
      if (size >= bodySize * HEADING_SIZE_RATIO) {
        const wrapsPreviousTitle = last?.kind === "heading" && previousSize === size && gap <= size * HEADING_WRAP_RATIO;
        if (wrapsPreviousTitle) last.text += ` ${line.text}`;
        else blocks.push({ kind: "heading", level: headingLevel(size, headingSizes), text: line.text });
        continue;
      }

      // List item: starts with a bullet or a number.
      const marker = LIST_MARKER.exec(line.text);
      if (marker?.[1]) {
        blocks.push({ kind: "list-item", marker: marker[1], text: line.text.slice(marker[0].length) });
        continue;
      }

      // Otherwise: the rest of the current paragraph (or list item) if close enough, or a new paragraph.
      const continuesLast = (last?.kind === "paragraph" || last?.kind === "list-item") && gap <= lineGap * PARAGRAPH_GAP_RATIO;
      if (continuesLast) last.text += ` ${line.text}`;
      else blocks.push({ kind: "paragraph", text: line.text });
    }
  }

  return blocks;
}

/** pdf.js gives 9.99999975 or 10.0000001 for a 10-point font: round to half a point. */
function roundSize(size: number): number {
  return Math.round(size * 2) / 2;
}

/** The body text is the font size that covers the most characters. */
function findBodySize(lines: Line[]): number {
  const charsBySize = new Map<number, number>();
  for (const line of lines) {
    const size = roundSize(line.fontSize);
    charsBySize.set(size, (charsBySize.get(size) ?? 0) + line.text.length);
  }
  return mostFrequent(charsBySize);
}

/** The most common distance between two consecutive lines of body text. */
function findLineGap(lines: Line[], bodySize: number): number {
  const countByGap = new Map<number, number>();
  const body = lines.filter((line) => roundSize(line.fontSize) === bodySize);
  for (let i = 1; i < body.length; i++) {
    const gap = Math.round((body[i - 1]?.y ?? 0) - (body[i]?.y ?? 0));
    // Negative gaps happen when a new page starts: skip them.
    if (gap > 0) countByGap.set(gap, (countByGap.get(gap) ?? 0) + 1);
  }
  return countByGap.size > 0 ? mostFrequent(countByGap) : bodySize * 1.2;
}

/**
 * The heading sizes used on at least two pages, biggest first, e.g. [22, 17, 12].
 * A size used on a single page (the cover title) is left out, so it does not take level 1.
 */
function findHeadingSizes(pages: Line[][], bodySize: number): number[] {
  const pageCountBySize = new Map<number, number>();
  for (const page of pages) {
    const sizesOnPage = new Set(page.map((line) => roundSize(line.fontSize)));
    for (const size of sizesOnPage) {
      if (size >= bodySize * HEADING_SIZE_RATIO) pageCountBySize.set(size, (pageCountBySize.get(size) ?? 0) + 1);
    }
  }
  return [...pageCountBySize]
    .filter(([, pageCount]) => pageCount >= 2)
    .map(([size]) => size)
    .sort((a, b) => b - a);
}

/** Level 1 for the biggest heading size, 2 for the next one… capped at MAX_HEADING_LEVEL. */
function headingLevel(size: number, headingSizes: number[]): number {
  const biggerSizes = headingSizes.filter((headingSize) => headingSize > size).length;
  return Math.min(biggerSizes + 1, MAX_HEADING_LEVEL);
}

function mostFrequent<K>(counts: Map<K, number>): K {
  return [...counts].sort((a, b) => b[1] - a[1])[0]![0];
}

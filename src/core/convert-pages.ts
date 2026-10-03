import { groupBlocks } from "./layout/group-blocks";
import { groupLines } from "./layout/group-lines";
import { toMarkdown } from "./render/to-markdown";
import { toText } from "./render/to-text";
import type { TextItem } from "./types";

export interface Conversion {
  text: string;
  markdown: string;
}

/** The whole pipeline: items → lines → blocks, then both outputs from the same blocks. */
export function convertPages(pages: TextItem[][]): Conversion {
  const blocks = groupBlocks(pages.map(groupLines));
  return { text: toText(blocks), markdown: toMarkdown(blocks) };
}

import type { Block } from "../types";

export function toMarkdown(blocks: Block[]): string {
  return blocks.map(toMarkdownBlock).join("\n\n");
}

function toMarkdownBlock(block: Block): string {
  switch (block.kind) {
    case "heading":
      return `${"#".repeat(block.level)} ${block.text}`;
    case "paragraph":
      return block.text;
    case "list-item":
      // Numbered items keep their number ("1."), bullets become "-".
      return /^\d/.test(block.marker) ? `${block.marker} ${block.text}` : `- ${block.text}`;
  }
}

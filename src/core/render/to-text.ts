import type { Block } from "../types";

/** Plain text: one block per paragraph, list markers kept as in the PDF. */
export function toText(blocks: Block[]): string {
  return blocks
    .map((block) => (block.kind === "list-item" ? `${block.marker} ${block.text}` : block.text))
    .join("\n\n");
}

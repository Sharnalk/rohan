/** A piece of text as drawn in the PDF. Positions are in points, y grows upwards. */
export interface TextItem {
  text: string;
  endsLine: boolean;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  bold: boolean;
  italic: boolean;
}

/** A visual line of a page, rebuilt from the text items drawn at the same height. */
export interface Line {
  text: string;
  y: number;
  fontSize: number; // largest size of the line
}

/** A unit of the document structure, shared by the text and Markdown renderers. */
export type Block =
  | { kind: "heading"; level: number; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list-item"; marker: string; text: string };

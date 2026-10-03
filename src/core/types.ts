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

export interface Line {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  bold: boolean; // Say if actual Line is a title
}
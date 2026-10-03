import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { TextItem } from "../core/types";

GlobalWorkerOptions.workerSrc = workerUrl;

const BOLD_FONT = /bold|semibold|black|heavy/i;
const ITALIC_FONT = /italic|oblique/i;
const INVISIBLE_CHARS = /[\u200B-\u200D\uFEFF]/g;

/** Reads a PDF and returns its text items, one array per page. */
export async function extractItems(data: ArrayBuffer): Promise<TextItem[][]> {
  const pdf = await getDocument({ data }).promise;
  const pages: TextItem[][] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    await page.getOperatorList();

    const items = content.items
      .filter((item) => "str" in item) // keep text items only; structure markers have no "str"
      .map((item) => {
        const fontName: string = page.commonObjs.get(item.fontName)?.name ?? "";
        
        return {
          text: item.str.replace(INVISIBLE_CHARS, ""),
          endsLine: item.hasEOL,
          x: item.transform[4],
          y: item.transform[5],
          width: item.width,
          fontSize: item.height,
          bold: BOLD_FONT.test(fontName),
          italic: ITALIC_FONT.test(fontName),
        };
      });

    pages.push(items);
  }

  return pages;
}
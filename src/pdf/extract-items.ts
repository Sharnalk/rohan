import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { TextItem } from "../core/types";

GlobalWorkerOptions.workerSrc = workerUrl;

/** Reads a PDF and returns its text items, one array per page. */
export async function extractItems(data: ArrayBuffer): Promise<TextItem[][]> {
  const pdf = await getDocument({ data }).promise;
  const pages: TextItem[][] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    const items = content.items
      .filter((item) => "str" in item) .filter((item) => "str" in item)
      .map((item) => ({ text: item.str, endsLine: item.hasEOL }));

    pages.push(items);
  }

  return pages;
}

/** Saves `content` as a file named `name`, through a temporary link. */
export function download(content: string, name: string): void {
  const type = name.endsWith(".md") ? "text/markdown" : "text/plain";
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

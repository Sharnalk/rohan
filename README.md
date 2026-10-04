# rohan

Browser extension to convert PDFs into Markdown (`.md`) or plain text (`.txt`).
Everything runs in your browser: the PDF is never sent anywhere.

## Features

- **On a PDF tab**: click the toolbar button to copy or download the PDF you are reading, as text or Markdown.
  When a web PDF finishes loading, the black hat of the icon tips and turns into Heaven's Door's hat
  (once access to websites is given).
- **Converter page**: drop any PDF from your computer, preview the result, then copy or download it.
- Markdown output detects headings (from font sizes), paragraphs and lists.
- Light and dark themes. Works offline.

## Privacy

rohan collects no data and makes no network request of its own.

| Permission | Why |
| --- | --- |
| `activeTab` | Read the URL of the current tab, to know whether it shows a PDF. |
| Access to websites (optional) | Download the PDF shown in the tab to convert it, and recognise PDF tabs to animate the icon. Asked on the first PDF, never at install. |

## Install

- Chrome Web Store: _coming soon_
- Firefox Add-ons: _coming soon_

## Build from source

Requirements: Node.js 22 or later, pnpm 12.8.1 (`corepack enable` installs the right version).

```bash
pnpm install --frozen-lockfile
pnpm build
```

The extension is built in `dist/`. Type checking: `pnpm typecheck`.

To try it without installing from a store:

- **Chrome**: `chrome://extensions` → Developer mode → *Load unpacked* → select `dist/`.
- **Firefox**: `about:debugging#/runtime/this-firefox` → *Load Temporary Add-on* → select `dist/manifest.json`.

`pnpm dev` rebuilds on every change; reload the extension to see it.

### Local PDFs (`file://`)

- **Chrome**: enable *Allow access to file URLs* in the extension details.
- **Firefox**: extensions cannot read local files. Use the converter page and drop the file.

## Web version

The converter page also works as a plain website:

```bash
docker build -t rohan .
docker run -p 8080:80 rohan
```

Then open http://localhost:8080.

## Project structure

```
src/pdf/     PDF reading (pdf.js) → text items
src/core/    items → lines → blocks → text / Markdown
src/ui/      converter page and toolbar popup
public/      manifest, icons and scripts copied as is
```

## License

[MIT](LICENSE)

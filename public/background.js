// When a tab finishes loading a PDF, the black toolbar hat becomes Heaven's Door's hat (with a tip of the hat),
// to show that rohan can convert it. The browser puts the black hat back when the tab loads another page.
// The tab URL is only visible once the user has given access to websites (asked by the popup on the first PDF).

/** Frames of public/icons/heaven-tip-*.png: the hat goes up and back down, twice. */
const FRAMES = [1, 2, 3, 4, 3, 2, 1, 2, 3, 4, 3, 2, 1];
const FRAME_MS = 60;

function icon(name) {
  return { 16: `icons/${name}-16.png`, 32: `icons/${name}-32.png` };
}

/** Same rule as the popup, but only for web PDFs: local files cannot be read on Firefox. */
function isWebPdf(url) {
  const { protocol, pathname } = new URL(url);
  return (protocol === "https:" || protocol === "http:") && /\.pdf$/i.test(pathname);
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url || !isWebPdf(tab.url)) return;

  try {
    for (const frame of FRAMES) {
      await chrome.action.setIcon({ tabId, path: icon(`heaven-tip-${frame}`) });
      await new Promise((resolve) => setTimeout(resolve, FRAME_MS));
    }
    await chrome.action.setIcon({ tabId, path: icon("heaven") });
  } catch {
    // The tab was closed during the animation.
  }
});

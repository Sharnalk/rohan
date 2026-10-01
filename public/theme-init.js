// Runs before the page is painted. Plain JS in public/ because Manifest V3 forbids inline scripts.
try {
  const saved = localStorage.getItem("rohan-theme");
  if (saved === "light" || saved === "dark") {
    document.documentElement.dataset.theme = saved;
  }
} catch {
  // Storage unavailable: the system theme applies.
}

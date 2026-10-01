const STORAGE_KEY = "rohan-theme";

type Theme = "light" | "dark";

const systemDark = matchMedia("(prefers-color-scheme: dark)");

/** Theme chosen with the toggle if any, otherwise the system one. */
function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return systemDark.matches ? "dark" : "light";
}

export function setupThemeToggle(button: HTMLButtonElement): void {
  const updateLabel = () => {
    const label = currentTheme() === "dark" ? "Switch to light mode" : "Switch to dark mode";
    button.setAttribute("aria-label", label);
  };

  button.addEventListener("click", () => {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable: the choice only lasts for this page.
    }
    updateLabel();
  });

  systemDark.addEventListener("change", updateLabel);
  updateLabel();
}

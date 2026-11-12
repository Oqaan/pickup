const PREFIX = "scroll:";

// A reload starts at the top, only going back brings a position along
const [navigation] = performance.getEntriesByType(
  "navigation",
) as PerformanceNavigationTiming[];
if (navigation?.type !== "back_forward") {
  for (const k of Object.keys(sessionStorage)) {
    if (k.startsWith(PREFIX)) sessionStorage.removeItem(k);
  }
}

export const saveScroll = (key: string) =>
  sessionStorage.setItem(PREFIX + key, String(window.scrollY));

export const savedScroll = (key: string) =>
  Number(sessionStorage.getItem(PREFIX + key)) || 0;

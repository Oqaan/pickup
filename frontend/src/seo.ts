import type { SeriesDetail } from "./types";

// Keep in step with scripts/prerender.mjs so the build-time and client wording match.

export function seriesTitle(title: string) {
  return `Where does the ${title} anime leave off? - pickup`;
}

export function seriesDescription(series: SeriesDetail) {
  // Lead with the latest season that actually has a stopping point - usually the
  // one someone just finished
  const stops = series.adaptations.filter((a) => a.continueChapter != null);
  const last = stops[stops.length - 1];
  if (!last) {
    return `Finished the ${series.title} anime? pickup shows exactly which manga chapter to read next, checked by hand.`;
  }
  const volume =
    last.continueVolume != null ? `, volume ${last.continueVolume}` : "";
  return `Finished the ${series.title} anime? Continue the manga from chapter ${last.continueChapter}${volume}. Every stopping point is checked by hand.`;
}

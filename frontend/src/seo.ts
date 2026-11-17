import type { SeriesDetail } from "./types";

// Keep in step with middleware.ts so the crawler and client wording match.

export const ABOUT_TITLE = "About - pickup";
export const ABOUT_DESCRIPTION =
  "How pickup works: every anime to manga stopping point is checked by hand, one series at a time.";

export const LEGAL_TITLE = "Legal - pickup";
export const LEGAL_DESCRIPTION = "Imprint and privacy policy for pickup.moe.";

const sourceName = (sourceType?: string | null) =>
  sourceType === "light_novel" ? "light novel" : "manga";

export function seriesTitle(series: SeriesDetail) {
  return `Where to continue the ${series.title} ${sourceName(series.sourceType)}`;
}

export function seriesDescription(series: SeriesDetail) {
  const answer =
    series.sourceType === "light_novel" ? "volume" : "chapter and volume";
  return `Finished the ${series.title} anime? Find the exact ${answer} to continue the ${sourceName(series.sourceType)} from, for each season`;
}

import type { SeriesDetail } from "./types";

// Keep in step with middleware.ts so the crawler and client wording match.

export const ABOUT_TITLE = "About - pickup";
export const ABOUT_DESCRIPTION =
  "How pickup works: every anime to manga stopping point is checked by hand, one series at a time.";

export function seriesTitle(title: string) {
  return `Where to continue the ${title} manga`;
}

export function seriesDescription(series: SeriesDetail) {
  return `Finished the ${series.title} anime? Find the exact chapter and volume to continue the manga from, for each season`;
}

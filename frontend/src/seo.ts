import type { SeriesDetail } from "./types";

// Keep in step with middleware.ts so the crawler and client wording match.

export function seriesTitle(title: string) {
  return `Where to continue the ${title} manga`;
}

export function seriesDescription(series: SeriesDetail) {
  return `Finished the ${series.title} anime? Find the exact chapter and volume to continue the manga from, for each season`;
}

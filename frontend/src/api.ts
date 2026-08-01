import type { SeriesDetail, SeriesSummary } from "./types";

export async function fetchSeriesList(): Promise<SeriesSummary[]> {
  const res = await fetch("/api/series");
  if (!res.ok) throw new Error("Failed to load series");
  return res.json();
}

export async function fetchSeriesDetail(slug: string): Promise<SeriesDetail> {
  const res = await fetch(`/api/series/${slug}`);
  if (res.status === 404) throw new Error("not-found");
  if (!res.ok) throw new Error("Failed to load series");
  return res.json();
}

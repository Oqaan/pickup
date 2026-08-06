import type { SeriesDetail, SeriesSummary } from "./types";

// Empty in local dev, so requests stay relative and hit the Vite proxy.
// In production, set to the backend's URL (e.g. https://api.pickup.moe).
const API_BASE = import.meta.env.VITE_API_URL ?? "";

export async function fetchSeriesList(): Promise<SeriesSummary[]> {
  const res = await fetch(`${API_BASE}/api/series`);
  if (!res.ok) throw new Error("Failed to load series");
  return res.json();
}

export async function fetchSeriesDetail(slug: string): Promise<SeriesDetail> {
  const res = await fetch(`${API_BASE}/api/series/${slug}`);
  if (res.status === 404) throw new Error("not-found");
  if (!res.ok) throw new Error("Failed to load series");
  return res.json();
}

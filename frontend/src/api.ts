import type { SeriesDetail, SeriesSummary } from "./types";

// Empty in local dev, so requests stay relative and hit the Vite proxy.
// In production, set to the backend's URL (e.g. https://api.pickup.moe).
const API_BASE = import.meta.env.VITE_API_URL ?? "";

// Everything already downloaded, kept until the page is reloaded, so moving
// between pages never asks the server for the same data twice
let listCache: Promise<SeriesSummary[]> | null = null;
let listValue: SeriesSummary[] | null = null;
const detailCache = new Map<string, Promise<SeriesDetail>>();

// The list if it was already downloaded, otherwise null. Lets the home show
// its cards right away instead of the skeleton when the user comes back
export const cachedSeriesList = () => listValue;

export function fetchSeriesList(): Promise<SeriesSummary[]> {
  listCache ??= fetch(`${API_BASE}/api/series`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load series");
      return res.json() as Promise<SeriesSummary[]>;
    })
    .then((list) => (listValue = list))
    // Forget a failed request, or the error itself would be cached forever
    .catch((e: Error) => {
      listCache = null;
      throw e;
    });
  return listCache;
}

export function fetchSeriesDetail(slug: string): Promise<SeriesDetail> {
  const cached = detailCache.get(slug);
  if (cached) return cached;

  const pending = fetch(`${API_BASE}/api/series/${slug}`)
    .then((res) => {
      if (res.status === 404) throw new Error("not-found");
      if (!res.ok) throw new Error("Failed to load series");
      return res.json() as Promise<SeriesDetail>;
    })
    // Same as above: a failed request must not stay in the cache
    .catch((e: Error) => {
      detailCache.delete(slug);
      throw e;
    });

  detailCache.set(slug, pending);
  return pending;
}

// Loads a series before it is clicked, so the click opens it instantly.
// Errors are ignored, the real request will report them
export function prefetchSeriesDetail(slug: string) {
  void fetchSeriesDetail(slug).catch(() => {});
}

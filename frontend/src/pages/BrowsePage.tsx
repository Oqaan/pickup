import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { SeriesSummary } from "../types";
import {
  cachedSeriesList,
  fetchSeriesList,
  prefetchSeriesDetail,
  seededList,
} from "../api";
import { cover } from "../cover";
import { useSeo } from "../useSeo";

// Five per row from 1024px up, three from 640px, two below
const COVER_SIZES = "(min-width: 1024px) 210px, (min-width: 640px) 33vw, 45vw";

export default function BrowsePage() {
  useSeo({
    title: "All series on pickup",
    description:
      "Every series pickup covers. Find the anime you finished and get the exact manga chapter to continue from.",
    canonical: "/browse",
  });

  // Start with the list the page came with, then refresh it for real visitors
  const [series, setSeries] = useState<SeriesSummary[]>(
    () => cachedSeriesList() ?? seededList() ?? [],
  );

  useEffect(() => {
    fetchSeriesList()
      .then(setSeries)
      .catch(() => {});
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-6 pt-12 pb-0">
      <h1 className="font-display text-title text-sumi">All series</h1>
      <p className="font-body text-base text-sumi/70 mt-4 max-w-md leading-relaxed">
        Every series on pickup. Pick the one you were watching and get the
        chapter to read from.
      </p>

      <p className="font-mono text-xs tracking-widest text-ash mt-12 sm:mt-16">
        {series.length} SERIES
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10 mt-4">
        {series.map((s) => (
          <Link
            key={s.slug}
            to={`/anime/${s.slug}`}
            onPointerEnter={() => prefetchSeriesDetail(s.slug)}
            onFocus={() => prefetchSeriesDetail(s.slug)}
            className="group block"
          >
            <div className="aspect-2/3 bg-tone/30 overflow-hidden ring-1 ring-transparent group-hover:ring-sumi transition">
              {s.coverUrl && (
                <img
                  {...cover(s.coverUrl, [300, 600], COVER_SIZES)}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
              )}
            </div>
            <p className="font-body text-sm text-sumi group-hover:text-jump mt-3 leading-snug">
              {s.title}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}

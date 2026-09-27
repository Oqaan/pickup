import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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

// Divisible by two, three and five, so every page ends on a full row
const PER_PAGE = 30;

const SORTS = [
  { id: "popular", label: "LOOKED UP MOST" },
  { id: "az", label: "A-Z" },
] as const;

type Sort = (typeof SORTS)[number]["id"];

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

  const [params, setParams] = useSearchParams();
  const sort: Sort = params.get("sort") === "az" ? "az" : "popular";
  const sorted =
    sort === "az"
      ? [...series].sort((a, b) => a.title.localeCompare(b.title))
      : series;

  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const page = Math.min(Math.max(Number(params.get("page")) || 1, 1), pages);
  const visible = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Page 1 and the default sort stay out of the URL, so the plain /browse is the page itself
  const go = (next: { sort?: Sort; page?: number }) => {
    const nextSort = next.sort ?? sort;
    const nextPage = next.page ?? 1;
    const search = new URLSearchParams();
    if (nextSort !== "popular") search.set("sort", nextSort);
    if (nextPage > 1) search.set("page", String(nextPage));
    setParams(search);
    window.scrollTo(0, 0);
  };

  return (
    <main className="max-w-6xl mx-auto px-6 pt-12 pb-0">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-title text-sumi">Library</h1>
          <p className="font-mono text-xs tracking-widest text-ash mt-3">
            {series.length} SERIES, CHAPTER BY CHAPTER
          </p>
        </div>
        <div className="flex gap-2">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => go({ sort: s.id })}
              aria-pressed={sort === s.id}
              className={`font-mono text-xs tracking-widest px-4 py-2 border cursor-pointer transition ${
                sort === s.id
                  ? "border-sumi bg-sumi text-paper"
                  : "border-tone text-ash hover:border-sumi hover:text-sumi"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10 mt-10">
        {visible.map((s) => (
          <Link
            key={s.slug}
            to={`/anime/${s.slug}`}
            onPointerEnter={() => prefetchSeriesDetail(s.slug)}
            onFocus={() => prefetchSeriesDetail(s.slug)}
            className="group block"
          >
            <div className="spine relative aspect-2/3 bg-tone/30 overflow-hidden ring-1 ring-transparent group-hover:ring-sumi transition duration-200 group-hover:-translate-y-1">
              {s.coverUrl && (
                <img
                  {...cover(s.coverUrl, [300, 600], COVER_SIZES)}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <p className="font-body text-sm text-sumi group-hover:text-jump mt-3 leading-snug">
              {s.title}
            </p>
          </Link>
        ))}
      </div>

      {pages > 1 && (
        <nav
          aria-label="Pages"
          className="flex justify-center gap-2 border-t border-tone mt-12 pt-8"
        >
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => go({ page: n })}
              aria-current={n === page ? "page" : undefined}
              className={`w-10 h-10 font-mono text-xs border cursor-pointer transition ${
                n === page
                  ? "border-sumi bg-sumi text-paper"
                  : "border-tone text-ash hover:border-sumi hover:text-sumi"
              }`}
            >
              {n}
            </button>
          ))}
        </nav>
      )}
    </main>
  );
}

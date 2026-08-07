import { useEffect, useMemo, useState } from "react";
import type { SeriesSummary } from "../types";
import { fetchSeriesList } from "../api";
import Fuse from "fuse.js";
import { Link } from "react-router-dom";
import { useTitle } from "../useTitle";

export default function HomePage() {
  useTitle("pickup - where to start the manga after the anime");
  const [series, setSeries] = useState<SeriesSummary[]>([]);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchSeriesList()
      .then(setSeries)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(series, {
        keys: ["title", "aliases"],
        threshold: 0.3,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [series],
  );

  const results =
    query.length >= 2 ? fuse.search(query).map((r) => r.item) : series;

  const perPage = 10;
  const searching = query.length >= 2;
  const visible = searching || showAll ? results : results.slice(0, perPage);

  const label =
    query.length < 2
      ? "MOST READ"
      : `${results.length} ${results.length === 1 ? "RESULT" : "RESULTS"}`;

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-6 pt-12 sm:pt-20 pb-0">
        <p className="font-mono text-xs tracking-widest text-tone">
          SOMETHING WENT WRONG
        </p>
        <h1 className="font-display text-4xl text-sumi leading-tight mt-3">
          Couldn't load the list.
        </h1>
        <p className="font-body text-base text-sumi/70 mt-4 max-w-md leading-relaxed">
          Try reloading the page. If it keeps happening, something's off on my
          end.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 pt-12 pb-0">
      <h1 className="font-display text-4xl text-sumi leading-tight max-w-lg">
        Stop watching.
        <br />
        Start reading.
      </h1>

      <p className="font-body text-base text-sumi/70 mt-4 max-w-md leading-relaxed">
        Wherever you left the anime, pick the series and get the chapter to read
        from.
      </p>

      <div className="mt-12 sm:mt-20 flex items-baseline gap-4 border-b-2 border-tone focus-within:border-sumi pb-3">
        <span className="font-display text-3xl sm:text-4xl text-jump leading-none select-none">
          →
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a series"
          aria-label="Search a series"
          className="flex-1 min-w-0 font-display text-3xl sm:text-4xl bg-transparent text-sumi placeholder:text-tone focus:outline-none"
        />
      </div>

      <p className="font-mono text-xs tracking-widest text-tone mt-12 sm:mt-16">
        {label}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-10 mt-4">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={i === 9 ? "sm:hidden" : ""}>
                <div className="aspect-2/3 bg-tone/20" />
                <div className="h-3 w-3/4 bg-tone/20 mt-3" />
              </div>
            ))
          : visible.map((s, i) => (
              <Link
                key={s.slug}
                to={`/anime/${s.slug}`}
                className={`group ${!searching && !showAll && i === 9 ? "sm:hidden" : ""}`}
              >
                <div className="aspect-2/3 bg-tone/30 overflow-hidden ring-1 ring-transparent group-hover:ring-sumi transition">
                  {s.coverUrl && (
                    <img
                      src={s.coverUrl}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
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

      {!searching && !showAll && results.length > perPage && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full border-t border-tone mt-10 pt-6 font-mono text-xs tracking-widest text-tone hover:text-jump cursor-pointer"
        >
          SHOW ALL {results.length} SERIES
        </button>
      )}

      {query.length >= 2 && results.length === 0 && (
        <p className="font-body text-sm text-sumi/70 mt-8 max-w-prose">
          Not in the database yet. It's a small list for now, growing as I
          verify each entry by hand.
        </p>
      )}
    </main>
  );
}

import { useEffect, useMemo, useState } from "react";
import type { SeriesSummary } from "../types";
import { fetchSeriesList } from "../api";
import Fuse from "fuse.js";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [series, setSeries] = useState<SeriesSummary[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchSeriesList().then(setSeries);
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(series, {
        keys: ["title", "aliases"],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [series],
  );

  const results =
    query.length >= 2 ? fuse.search(query).map((r) => r.item) : series;

  const label =
    query.length < 2
      ? "MOST READ"
      : `${results.length} ${results.length === 1 ? "RESULT" : "RESULTS"}`;

  return (
    <main className="max-w-4xl mx-auto px-6 pt-16 pb-0">
      <h1 className="font-display text-4xl text-sumi leading-tight mt-6 max-w-lg">
        Stop watching.
        <br />
        Start reading.
      </h1>

      <p className="font-body text-base text-sumi/70 mt-5 max-w-md leading-relaxed">
        Wherever you left the anime, pick the series and get the chapter to read
        from.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a series"
        className="font-mono text-xl w-full mt-14 pb-3 bg-transparent border-b border-tone text-sumi placeholder:text-tone focus:outline-none focus:border-jump"
      />

      <p className="font-mono text-xs tracking-widest text-tone mt-16">
        {label}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-10 mt-6">
        {results.map((s) => (
          <Link key={s.slug} to={`/anime/${s.slug}`} className="group">
            <div className="aspect-2/3 bg-tone/30 overflow-hidden ring-1 ring-transparent group-hover:ring-sumi transition">
              {s.coverUrl && (
                <img
                  src={s.coverUrl}
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

      {query.length >= 2 && results.length === 0 && (
        <p className="font-body text-sm text-sumi/70 mt-8 max-w-prose">
          Not in the database yet. It's a small list for now, growing as I
          verify each entry by hand.
        </p>
      )}
    </main>
  );
}

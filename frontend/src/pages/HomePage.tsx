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
    () => new Fuse(series, { keys: ["title"], threshold: 0.4 }),
    [series],
  );

  const results = query ? fuse.search(query).map((r) => r.item) : series;

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-6xl text-sumi leading-none">pickup</h1>
      <p className="font-body text-sumi/70 mt-3">
        Finished the anime? Find out where to start the manga.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a series"
        className="font-mono text-lg w-full mt-12 pb-2 bg-transparent border-b border-tone text-sumi placeholder:text-tone focus:outline-none focus:border-jump"
      />

      <ul className="mt-8 space-y-1">
        {results.map((s) => (
          <li key={s.slug}>
            <Link
              to={`/anime/${s.slug}`}
              className="font-body text-lg text-sumi hover:text-jump block py-2"
            >
              {s.title}
            </Link>
          </li>
        ))}
      </ul>

      {query && results.length === 0 && (
        <p className="font-body text-sm text-tone mt-8">
          Nothing found. It might not be in the database yet.
        </p>
      )}
    </main>
  );
}

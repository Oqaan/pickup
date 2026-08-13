import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import type { SeriesSummary } from "../types";
import {
  cachedSeriesList,
  fetchSeriesList,
  prefetchSeriesDetail,
} from "../api";
import { cover } from "../cover";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTitle } from "../useTitle";

// Opening a series throws this page away, so save what the user had open.
// Saved per history entry, so going back finds it and a fresh visit does not
type Remembered = { showAll: boolean; scroll: number };

type FuseModule = typeof import("fuse.js").default;

// How wide a cover lands on screen: three per row from 640px up, two below
const COVER_SIZES = "(min-width: 640px) 280px, 50vw";

const remembered = (key: string): Remembered | null => {
  const raw = sessionStorage.getItem(`home:${key}`);
  return raw ? (JSON.parse(raw) as Remembered) : null;
};

const remember = (key: string, patch: Partial<Remembered>) => {
  const base = remembered(key) ?? { showAll: false, scroll: 0 };
  sessionStorage.setItem(`home:${key}`, JSON.stringify({ ...base, ...patch }));
};

// A reload starts clean, so drop it all unless the user came back. The history
// key cannot tell us that, it survives a reload too. Runs once per page load
const [navigation] = performance.getEntriesByType(
  "navigation",
) as PerformanceNavigationTiming[];
if (navigation?.type !== "back_forward") {
  for (const k of Object.keys(sessionStorage)) {
    if (k.startsWith("home:")) sessionStorage.removeItem(k);
  }
}

export default function HomePage() {
  useTitle("pickup - where to start the manga after the anime");
  const [series, setSeries] = useState<SeriesSummary[]>(
    () => cachedSeriesList() ?? [],
  );
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(() => cachedSeriesList() === null);
  const [error, setError] = useState(false);
  const reduceMotion = useReducedMotion();
  const { key: historyKey } = useLocation();
  const [showAll, setShowAll] = useState(
    () => remembered(historyKey)?.showAll ?? false,
  );
  const [Fuse, setFuse] = useState<FuseModule | null>(null);
  const [wantsFuse, setWantsFuse] = useState(false);
  // A saved scroll position means the user is coming back to a list they have
  // already seen. The cards then skip their entrance, which would otherwise
  // run as a wave down the page while they wait at the bottom for their spot
  const [returning] = useState(() => (remembered(historyKey)?.scroll ?? 0) > 0);

  const grid = {
    hidden: {},
    shown: { transition: { staggerChildren: reduceMotion ? 0 : 0.03 } },
  };

  const card = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
    shown: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    fetchSeriesList()
      .then(setSeries)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    remember(historyKey, { showAll });
  }, [historyKey, showAll]);

  // Wait for the cards, the skeleton is too short to scroll that far
  useLayoutEffect(() => {
    if (loading) return;
    const y = remembered(historyKey)?.scroll ?? 0;
    if (y > 0) window.scrollTo(0, y);
  }, [loading, historyKey]);

  // Most visitors never search, so the search library is only fetched once
  // the field is clicked, well before the second character starts a search
  useEffect(() => {
    if (!wantsFuse) return;
    let live = true;
    void import("fuse.js").then((m) => live && setFuse(() => m.default));
    return () => {
      live = false;
    };
  }, [wantsFuse]);

  const fuse = useMemo(
    () =>
      Fuse
        ? new Fuse(series, {
            keys: ["title", "aliases"],
            threshold: 0.3,
            ignoreLocation: true,
            minMatchCharLength: 2,
          })
        : null,
    [Fuse, series],
  );

  const results =
    query.length >= 2 && fuse ? fuse.search(query).map((r) => r.item) : series;

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
        <p className="font-mono text-xs tracking-widest text-ash">
          SOMETHING WENT WRONG
        </p>
        <h1 className="font-display text-notice text-sumi mt-3">
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
      <h1 className="font-display text-title text-sumi max-w-lg">
        Stop watching.
        <br />
        Start reading.
      </h1>

      <p className="font-body text-base text-sumi/70 mt-4 max-w-md leading-relaxed">
        Wherever you left the anime, pick the series and get the chapter to read
        from.
      </p>

      <div className="mt-12 sm:mt-20 flex items-baseline gap-4 border-b-2 border-tone focus-within:border-sumi pb-3">
        <span className="font-display text-input text-jump select-none">→</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setWantsFuse(true)}
          placeholder="Search a series"
          aria-label="Search a series"
          className="flex-1 min-w-0 font-display text-input bg-transparent text-sumi placeholder:text-tone focus:outline-none"
        />
      </div>

      <p className="font-mono text-xs tracking-widest text-ash mt-12 sm:mt-16">
        {label}
      </p>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-10 mt-4"
        aria-busy={loading}
      >
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={i === 9 ? "sm:hidden" : ""}>
              <div className="aspect-2/3 bg-tone/20" />
              <div className="h-3 w-3/4 bg-tone/20 mt-3" />
            </div>
          ))
        ) : (
          <motion.div
            className="contents"
            variants={grid}
            initial={returning ? "shown" : "hidden"}
            animate="shown"
          >
            <AnimatePresence mode="popLayout">
              {visible.map((s, i) => (
                <motion.div
                  key={s.slug}
                  layout={reduceMotion ? false : "position"}
                  variants={card}
                  exit={{ opacity: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.25, ease: [0.2, 0, 0, 1] }
                  }
                  className={
                    !searching && !showAll && i === 9 ? "sm:hidden" : ""
                  }
                >
                  <Link
                    to={`/anime/${s.slug}`}
                    // Save the scroll position on the way out
                    onClick={() =>
                      remember(historyKey, { scroll: window.scrollY })
                    }
                    // Load the series before the click, not after it
                    onPointerEnter={() => prefetchSeriesDetail(s.slug)}
                    onFocus={() => prefetchSeriesDetail(s.slug)}
                    className="group block"
                  >
                    <div className="aspect-2/3 bg-tone/30 overflow-hidden ring-1 ring-transparent group-hover:ring-sumi transition">
                      {s.coverUrl && (
                        <img
                          {...cover(s.coverUrl, [300, 600], COVER_SIZES)}
                          alt=""
                          // The first row is the biggest thing a visitor sees,
                          // so it loads straight away. On the way back it sits
                          // above their scroll position and would only take
                          // bandwidth from the covers they are looking at
                          loading={i < 4 && !returning ? "eager" : "lazy"}
                          fetchPriority={
                            i < 4 && !returning ? "high" : undefined
                          }
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <p className="font-body text-sm text-sumi group-hover:text-jump mt-3 leading-snug">
                      {s.title}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {!searching && !showAll && results.length > perPage && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full border-t border-tone mt-10 pt-6 font-mono text-xs tracking-widest text-ash hover:text-jump cursor-pointer"
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

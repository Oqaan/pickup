import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { SeriesSummary } from "../types";
import {
  cachedSeriesList,
  fetchSeriesList,
  prefetchSeriesDetail,
  seededList,
} from "../api";
import { cover } from "../cover";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSeo } from "../useSeo";
import SearchBar from "../components/SearchBar";

// Opening a series throws this page away, so save what the user had open.
// Saved per history entry, so going back finds it and a fresh visit does not
type Remembered = { shown: number; scroll: number };

type FuseModule = typeof import("fuse.js").default;

// How wide a cover lands on screen: five per row from 1024px up, three from 640px, two below
const COVER_SIZES = "(min-width: 1024px) 210px, (min-width: 640px) 33vw, 50vw";
const SHELF_SIZES = "(min-width: 1024px) 210px, (min-width: 640px) 30vw, 42vw";

// How many cards the list starts with, and how many each click adds
const PER_PAGE = 10;
const STEP = 30;

// Cards past this point appear without animating. A layout animation measures
// every element it sits on, and the entrance is over before they are scrolled to
const ANIMATED = 20;

const remembered = (key: string): Remembered | null => {
  const raw = sessionStorage.getItem(`home:${key}`);
  return raw ? (JSON.parse(raw) as Remembered) : null;
};

const remember = (key: string, patch: Partial<Remembered>) => {
  const base = remembered(key) ?? { shown: PER_PAGE, scroll: 0 };
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
  useSeo({
    title: "pickup - where to start the manga after the anime",
    canonical: "/",
  });
  // Start with the list the page came with, so it shows right away without the API
  const [series, setSeries] = useState<SeriesSummary[]>(
    () => cachedSeriesList() ?? seededList() ?? [],
  );
  // A search Google links to arrives as /?q=term, so seed the field from it
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(
    () => cachedSeriesList() === null && seededList() === null,
  );
  const [error, setError] = useState(false);
  const reduceMotion = useReducedMotion();
  const { key: historyKey } = useLocation();
  const [shown, setShown] = useState(
    () => remembered(historyKey)?.shown ?? PER_PAGE,
  );
  const [searchShown, setSearchShown] = useState(PER_PAGE);
  const [Fuse, setFuse] = useState<FuseModule | null>(null);
  // A query from the URL needs the search library right away, not on first click
  const [wantsFuse, setWantsFuse] = useState(initialQuery.length >= 2);
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

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSeriesList()
      .then(setSeries)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    remember(historyKey, { shown });
  }, [historyKey, shown]);

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

  // Both lists grow a page at a time. A search keeps its own count so that
  // clearing the field puts the browsing list back where the user left it
  const searching = query.length >= 2;
  const limit = searching ? searchShown : shown;
  const visible = results.slice(0, limit);
  const remaining = results.length - limit;
  // Three columns leave the tenth card alone on its own row, so it waits for
  // the next page. Only while there is a next page to wait for
  const clamped = limit === PER_PAGE && remaining > 0;

  const newest = series
    .filter((s) => s.addedOrder != null)
    .sort((a, b) => b.addedOrder! - a.addedOrder!)
    .slice(0, 5);

  const label =
    query.length < 2
      ? "MOST READ"
      : `${results.length} ${results.length === 1 ? "RESULT" : "RESULTS"}`;

  if (error) {
    return (
      <main className="max-w-6xl mx-auto px-6 pt-12 sm:pt-20 pb-0">
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
    <main className="max-w-6xl mx-auto px-6 pt-12 pb-0">
      <h1 className="font-display text-title text-sumi max-w-lg">
        Stop watching.
        <br />
        Start reading.
      </h1>

      <p className="font-body text-base text-sumi/70 mt-4 max-w-md leading-relaxed">
        Wherever you left the anime, pick the series and get the chapter to read
        from.
      </p>

      <div className="mt-12 sm:mt-16">
        <SearchBar
          ref={searchRef}
          value={query}
          onChange={(value) => {
            setQuery(value);
            // A new query is a new list, so it starts at the first page again
            setSearchShown(PER_PAGE);
          }}
          onFocus={() => setWantsFuse(true)}
          onClear={() => {
            setQuery("");
            setSearchShown(PER_PAGE);
            searchRef.current?.focus();
          }}
        />
      </div>

      {!searching && newest.length > 0 && (
        <section className="mt-12 sm:mt-16">
          <p className="font-mono text-xs tracking-widest text-jump">
            NEWLY ADDED
          </p>
          <h2 className="font-display text-notice text-sumi mt-3">
            New on the shelf.
          </h2>
          <div className="flex lg:grid lg:grid-cols-5 gap-x-6 mt-6 -mx-6 px-6 scroll-px-6 lg:mx-0 lg:px-0 overflow-x-auto snap-x snap-mandatory">
            {newest.map((s) => (
              <Link
                key={s.slug}
                to={`/anime/${s.slug}`}
                onClick={() => remember(historyKey, { scroll: window.scrollY })}
                onPointerEnter={() => prefetchSeriesDetail(s.slug)}
                onFocus={() => prefetchSeriesDetail(s.slug)}
                className="group block shrink-0 w-[42%] sm:w-[30%] lg:w-auto snap-start"
              >
                <div className="aspect-2/3 bg-tone/30 overflow-hidden ring-1 ring-transparent group-hover:ring-sumi transition">
                  {s.coverUrl && (
                    <img
                      {...cover(s.coverUrl, [300, 600], SHELF_SIZES)}
                      alt=""
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
        </section>
      )}

      <p className="font-mono text-xs tracking-widest text-ash mt-12 sm:mt-16">
        {label}
      </p>
      {!searching && (
        <h2 className="font-display text-notice text-sumi mt-3">
          Fan favorites.
        </h2>
      )}

      <div
        className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10 ${searching ? "mt-4" : "mt-6"}`}
        aria-busy={loading}
      >
        {loading ? (
          Array.from({ length: PER_PAGE }).map((_, i) => (
            <div key={i} className={i === 9 ? "sm:max-lg:hidden" : ""}>
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
              {visible.map((s, i) => {
                const animated = i < ANIMATED;
                const Card = animated ? motion.div : "div";
                return (
                  <Card
                    key={s.slug}
                    {...(animated && {
                      layout: reduceMotion ? false : ("position" as const),
                      variants: card,
                      exit: { opacity: 0 },
                      transition: reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.25, ease: [0.2, 0, 0, 1] as const },
                    })}
                    className={clamped && i === 9 ? "sm:max-lg:hidden" : ""}
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
                      <div className="relative aspect-2/3 bg-tone/30 overflow-hidden ring-1 ring-transparent group-hover:ring-sumi transition">
                        {s.coverUrl && (
                          <img
                            {...cover(s.coverUrl, [300, 600], COVER_SIZES)}
                            alt=""
                            // The first row is the biggest thing a visitor sees,
                            // so it loads straight away. On the way back it sits
                            // above their scroll position and would only take
                            // bandwidth from the covers they are looking at
                            loading={i < 5 && !returning ? "eager" : "lazy"}
                            fetchPriority={
                              i < 5 && !returning ? "high" : undefined
                            }
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        )}
                        {!searching && i < 10 && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 bottom-0 bg-paper pr-3 pt-2 font-display text-title text-jump"
                          >
                            {i + 1}
                          </span>
                        )}
                      </div>
                      <p className="font-body text-sm text-sumi group-hover:text-jump mt-3 leading-snug">
                        {s.title}
                      </p>
                    </Link>
                  </Card>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {remaining > 0 && (
        <button
          onClick={() =>
            searching
              ? setSearchShown((n) => n + STEP)
              : setShown((n) => n + STEP)
          }
          className="w-full border-t border-tone mt-10 pt-6 font-mono text-xs tracking-widest text-ash hover:text-jump cursor-pointer"
        >
          {remaining <= STEP
            ? `SHOW ALL ${results.length} ${searching ? "RESULTS" : "SERIES"}`
            : `SHOW ${STEP} MORE`}
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

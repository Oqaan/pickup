import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { SeriesDetail } from "../types";
import { fetchSeriesDetail } from "../api";
import { useTitle } from "../useTitle";
import { cover } from "../cover";
import CountUp from "../components/CountUp";

export default function SeriesPage() {
  const { slug } = useParams();
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  // Going back is what leaves the home list as the user had it. The key is
  // "default" when they opened this link directly, so there is nothing to go
  // back to
  const { key: historyKey } = useLocation();
  const cameFromApp = historyKey !== "default";

  const backToSearch = cameFromApp ? (
    <button
      onClick={() => navigate(-1)}
      className="font-mono text-xs tracking-widest text-ash hover:text-jump cursor-pointer"
    >
      ← BACK TO SEARCH
    </button>
  ) : (
    <Link
      to="/"
      className="font-mono text-xs tracking-widest text-ash hover:text-jump"
    >
      ← BACK TO SEARCH
    </Link>
  );

  const swap = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduceMotion ? 0 : -6 },
    transition: {
      duration: reduceMotion ? 0 : 0.2,
      ease: [0.2, 0, 0, 1] as const,
    },
  };

  useTitle(series ? `${series.title} - pickup` : "pickup");

  useEffect(() => {
    if (!slug) return;
    fetchSeriesDetail(slug)
      .then(setSeries)
      .catch((e: Error) => setError(e.message));
  }, [slug]);

  if (error === "not-found") {
    return (
      <main className="max-w-2xl mx-auto px-6 pt-12 sm:pt-20 pb-0">
        <p className="font-mono text-xs tracking-widest text-ash">NOT FOUND</p>
        <h1 className="font-display text-notice text-sumi mt-3">
          No entry for "{slug}" yet.
        </h1>
        <p className="font-body text-base text-sumi/70 mt-4 max-w-md leading-relaxed">
          This one isn't in the database. The list grows by hand, one verified
          series at a time.
        </p>
        <div className="flex gap-4 mt-8 font-mono text-xs tracking-widest">
          <Link to="/" className="text-sumi hover:text-jump">
            ← BACK TO SEARCH
          </Link>
          <span className="text-tone">·</span>
          <a
            href="https://github.com/Oqaan/pickup/issues/new"
            target="_blank"
            rel="noreferrer"
            className="text-sumi hover:text-jump"
          >
            SUGGEST IT
          </a>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-2xl mx-auto px-6 pt-12 sm:pt-20 pb-0">
        <p className="font-mono text-xs tracking-widest text-ash">
          SOMETHING WENT WRONG
        </p>
        <h1 className="font-display text-notice text-sumi mt-3">
          Couldn't load this one.
        </h1>
        <p className="font-body text-base text-sumi/70 mt-4 max-w-md leading-relaxed">
          Try reloading the page. If it keeps happening, something's off on my
          end.
        </p>
        <Link
          to="/"
          className="inline-block mt-8 font-mono text-xs tracking-widest text-sumi hover:text-jump"
        >
          ← BACK TO SEARCH
        </Link>
      </main>
    );
  }

  if (!series) {
    return (
      <main
        className="max-w-2xl mx-auto px-6 pt-12 sm:pt-20 pb-0"
        aria-busy="true"
      >
        <div className="h-3 w-32 bg-tone/20 mb-8" />
        <div className="h-12 w-64 bg-tone/30" />
        <div className="h-3 w-24 bg-tone/20 mt-4" />
        <div className="h-3 w-48 bg-tone/20 mt-12 sm:mt-16" />
        <div className="flex gap-2 mt-4">
          <div className="h-9 w-24 bg-tone/20" />
          <div className="h-9 w-24 bg-tone/20" />
        </div>
        <div className="mt-12 sm:mt-16 pt-8 border-t border-tone flex flex-col sm:flex-row gap-6 sm:gap-8 sm:items-start">
          <div className="flex-1 min-w-0">
            <div className="h-3 w-32 bg-tone/20" />
            <div className="h-14 sm:h-17 w-48 bg-tone/30 mt-3" />
            <div className="h-3 w-56 bg-tone/20 mt-4" />
            <div className="h-3 w-40 bg-tone/20 mt-1" />
          </div>
          <div className="w-44 sm:w-40 shrink-0">
            <div className="aspect-2/3 bg-tone/30" />
            <div className="h-3 w-14 bg-tone/20 mt-2 mx-auto" />
          </div>
        </div>
      </main>
    );
  }

  const current = series.adaptations[selected];

  const hasInfo =
    series.author ||
    series.startYear ||
    series.publicationStatus ||
    series.totalChapters ||
    series.totalVolumes;

  const notes = current.notes ? (
    <p className="font-body text-sm text-sumi/70 mt-4 max-w-prose leading-relaxed">
      {current.notes}
    </p>
  ) : null;

  const status =
    series.publicationStatus === "RELEASING"
      ? "Ongoing"
      : series.publicationStatus === "FINISHED"
        ? "Finished"
        : series.publicationStatus;

  return (
    <main className="max-w-2xl mx-auto px-6 pt-12 sm:pt-20 pb-0">
      <div className="mb-8">{backToSearch}</div>
      <h1 className="font-display text-title text-sumi">{series.title}</h1>
      {series.titleNative && (
        <p className="font-jp text-sm text-ash mt-2">{series.titleNative}</p>
      )}
      {series.aliases && series.aliases.length > 0 && (
        <p className="font-mono text-xs text-ash mt-2">
          aka {series.aliases.join(", ")}
        </p>
      )}
      {series.notes && (
        <p className="font-body text-sm text-sumi/70 mt-4 max-w-prose leading-relaxed">
          {series.notes}
        </p>
      )}

      <p className="font-mono text-xs tracking-widest text-ash mt-12 sm:mt-16">
        HOW FAR HAVE YOU WATCHED?
      </p>

      <div className="flex flex-wrap gap-2 mt-4">
        {series.adaptations.map((a, i) => (
          <button
            key={a.name}
            onClick={() => setSelected(i)}
            aria-pressed={i === selected}
            className={`font-body text-sm px-4 py-2 border cursor-pointer transition ${
              i < selected
                ? "border-sumi bg-sumi/10 text-sumi"
                : i === selected
                  ? "border-sumi bg-sumi text-paper"
                  : "border-tone text-ash hover:border-sumi hover:text-sumi"
            }`}
          >
            {a.name}
          </button>
        ))}
      </div>

      <div className="mt-12 sm:mt-16 pt-8 border-t border-tone flex flex-col sm:flex-row gap-6 sm:gap-8 sm:items-start relative">
        <div className="flex-1 min-w-0">
          {current.caughtUp ? (
            <>
              <p className="font-mono text-xs tracking-widest text-ash">
                NOTHING LEFT
              </p>
              <p className="font-display text-answer-prose text-sumi text-balance mt-3">
                You're all caught up.
              </p>
              <p className="font-body text-sm text-sumi/70 mt-4 max-w-prose leading-relaxed">
                The anime covers the manga through to the end.
              </p>
              {notes}
            </>
          ) : current.continueChapter ? (
            <>
              <p className="font-mono text-xs tracking-widest text-ash">
                START READING AT
              </p>
              <p className="font-display text-answer text-jump mt-3">
                <CountUp value={current.continueChapter} />
                <span className="font-body text-base text-sumi ml-3">
                  chapter
                </span>
              </p>
              <p className="font-mono text-xs text-sumi mt-4">
                {current.continueVolume &&
                  `Volume ${current.continueVolume} · `}
                {current.name}
                {current.episodes && ` · ${current.episodes} episodes`}
              </p>
              {series.totalChapters && current.continueChapter && (
                <p className="font-mono text-xs text-ash mt-1">
                  {series.totalChapters - current.continueChapter + 1} chapters
                  left to read
                </p>
              )}
              {current.animeOriginal && (
                <p className="font-mono text-xs tracking-widest text-sumi border border-sumi px-3 py-2 mt-6 inline-block">
                  ANIME ORIGINAL STORY
                </p>
              )}
              {notes}
            </>
          ) : (
            <>
              <p className="font-mono text-xs tracking-widest text-ash">
                NO STARTING POINT
              </p>
              <p className="font-display text-answer-prose text-sumi text-balance mt-3">
                Not a continuation point.
              </p>
              {notes}
            </>
          )}
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          {current.coverUrl && (
            <motion.div
              key={current.coverUrl}
              {...swap}
              className="w-44 sm:w-40 shrink-0"
            >
              <img
                {...cover(current.coverUrl, [200, 400], "176px")}
                alt={`Volume ${current.continueVolume} cover`}
                fetchPriority="high"
                className="w-full aspect-2/3 object-cover"
              />
              <p className="font-mono text-xs text-ash mt-2 text-center">
                Vol. {current.continueVolume}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasInfo && (
        <dl className="mt-10 grid grid-cols-3 gap-x-8 gap-y-6">
          {series.author && (
            <div className="col-span-3 sm:col-span-1">
              <dt className="font-mono text-xs tracking-widest text-ash">
                AUTHOR
              </dt>
              <dd className="font-body text-sm text-sumi mt-1">
                {series.author}
              </dd>
            </div>
          )}
          {series.startYear && (
            <div>
              <dt className="font-mono text-xs tracking-widest text-ash">
                STARTED
              </dt>
              <dd className="font-body text-sm text-sumi mt-1">
                {series.startYear}
              </dd>
            </div>
          )}
          {status && (
            <div>
              <dt className="font-mono text-xs tracking-widest text-ash">
                STATUS
              </dt>
              <dd className="font-body text-sm text-sumi mt-1">{status}</dd>
            </div>
          )}
          {series.totalChapters && (
            <div>
              <dt className="font-mono text-xs tracking-widest text-ash">
                CHAPTERS
              </dt>
              <dd className="font-body text-sm text-sumi mt-1">
                {series.totalChapters}
              </dd>
            </div>
          )}
          {series.totalVolumes && (
            <div>
              <dt className="font-mono text-xs tracking-widest text-ash">
                VOLUMES
              </dt>
              <dd className="font-body text-sm text-sumi mt-1">
                {series.totalVolumes}
              </dd>
            </div>
          )}
        </dl>
      )}

      {(series.readingLinks.length > 0 || series.verifiedAt) && (
        <div className="mt-12 sm:mt-16 pt-8 border-t border-tone flex items-start justify-between gap-6 max-w-2xl">
          <div>
            {series.readingLinks.length > 0 && (
              <>
                <p className="font-mono text-xs tracking-widest text-ash">
                  WHERE TO READ
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  {series.readingLinks.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-body text-sm px-4 py-2 border border-tone text-sumi hover:bg-sumi hover:border-sumi hover:text-paper transition"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>

          {series.verifiedAt && (
            <p className="font-mono text-xs tracking-widest text-ash shrink-0">
              VERIFIED{" "}
              {new Date(series.verifiedAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      )}
    </main>
  );
}

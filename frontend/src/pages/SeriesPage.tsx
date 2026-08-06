import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { SeriesDetail } from "../types";
import { fetchSeriesDetail } from "../api";
import { useTitle } from "../useTitle";

export default function SeriesPage() {
  const { slug } = useParams();
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
        <p className="font-mono text-xs tracking-widest text-tone">NOT FOUND</p>
        <h1 className="font-display text-4xl text-sumi leading-tight mt-3">
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
        <p className="font-mono text-xs tracking-widest text-tone">
          SOMETHING WENT WRONG
        </p>
        <h1 className="font-display text-4xl text-sumi leading-tight mt-3">
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
        <div className="h-12 w-64 bg-tone/30" />
        <div className="h-3 w-24 bg-tone/20 mt-4" />
        <div className="h-3 w-48 bg-tone/20 mt-12 sm:mt-16" />
        <div className="flex gap-2 mt-4">
          <div className="h-9 w-24 bg-tone/20" />
          <div className="h-9 w-24 bg-tone/20" />
        </div>
        <div className="mt-12 sm:mt-16 pt-8 border-t border-tone">
          <div className="h-20 w-40 bg-tone/30" />
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

  const status =
    series.publicationStatus === "RELEASING"
      ? "Ongoing"
      : series.publicationStatus === "FINISHED"
        ? "Finished"
        : series.publicationStatus;

  return (
    <main className="max-w-2xl mx-auto px-6 pt-12 sm:pt-20 pb-0">
      <h1 className="font-display text-4xl sm:text-5xl text-sumi leading-none">
        {series.title}
      </h1>
      {series.titleNative && (
        <p className="font-jp text-sm text-tone mt-2">{series.titleNative}</p>
      )}

      {series.notes && (
        <p className="font-body text-sm text-sumi/70 mt-4 max-w-prose leading-relaxed">
          {series.notes}
        </p>
      )}

      <p className="font-mono text-xs tracking-widest text-tone mt-12 sm:mt-16">
        HOW FAR HAVE YOU WATCHED?
      </p>

      <div className="flex flex-wrap gap-2 mt-4">
        {series.adaptations.map((a, i) => (
          <button
            key={a.name}
            onClick={() => setSelected(i)}
            className={
              i === selected
                ? "font-body text-sm px-4 py-2 border border-sumi bg-sumi text-paper cursor-pointer"
                : "font-body text-sm px-4 py-2 border border-tone text-sumi hover:border-sumi cursor-pointer"
            }
          >
            {a.name}
          </button>
        ))}
      </div>

      <div className="mt-12 sm:mt-16 pt-8 border-t border-tone flex flex-col sm:flex-row gap-6 sm:gap-8 sm:items-start">
        <div className="flex-1 min-w-0">
          {current.caughtUp ? (
            <>
              <p className="font-mono text-xs tracking-widest text-tone">
                NOTHING LEFT
              </p>
              <p className="font-display text-4xl text-sumi leading-tight mt-3">
                You're all caught up.
              </p>
              <p className="font-body text-sm text-sumi/70 mt-4 max-w-prose leading-relaxed">
                The anime covers the manga through to the end.
              </p>
            </>
          ) : current.continueChapter ? (
            <>
              {current.animeOriginal && (
                <p className="font-mono text-xs tracking-widest text-jump">
                  ANIME ORIGINAL STORY
                </p>
              )}
              <p className="font-mono text-xs tracking-widest text-tone">
                START READING AT
              </p>
              <p className="font-display text-6xl sm:text-7xl text-jump leading-none mt-2">
                {current.continueChapter}
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
            </>
          ) : (
            <p className="font-body text-lg text-sumi">
              Not a continuation point.
            </p>
          )}

          {current.notes && (
            <p className="font-body text-sm text-sumi/70 mt-4 max-w-prose leading-relaxed">
              {current.notes}
            </p>
          )}
        </div>

        {current.coverUrl && (
          <div className="w-44 sm:w-40 shrink-0">
            <img
              src={current.coverUrl}
              alt={`Volume ${current.continueVolume} cover`}
              className="w-full aspect-2/3 object-cover"
            />
            <p className="font-mono text-xs text-tone mt-2 text-center">
              Vol. {current.continueVolume}
            </p>
          </div>
        )}
      </div>

      {hasInfo && (
        <dl className="mt-10 grid grid-cols-3 gap-x-8 gap-y-6">
          {series.author && (
            <div className="col-span-3 sm:col-span-1">
              <dt className="font-mono text-xs tracking-widest text-tone">
                AUTHOR
              </dt>
              <dd className="font-body text-sm text-sumi mt-1">
                {series.author}
              </dd>
            </div>
          )}
          {series.startYear && (
            <div>
              <dt className="font-mono text-xs tracking-widest text-tone">
                STARTED
              </dt>
              <dd className="font-body text-sm text-sumi mt-1">
                {series.startYear}
              </dd>
            </div>
          )}
          {status && (
            <div>
              <dt className="font-mono text-xs tracking-widest text-tone">
                STATUS
              </dt>
              <dd className="font-body text-sm text-sumi mt-1">{status}</dd>
            </div>
          )}
          {series.totalChapters && (
            <div>
              <dt className="font-mono text-xs tracking-widest text-tone">
                CHAPTERS
              </dt>
              <dd className="font-body text-sm text-sumi mt-1">
                {series.totalChapters}
              </dd>
            </div>
          )}
          {series.totalVolumes && (
            <div>
              <dt className="font-mono text-xs tracking-widest text-tone">
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
                <p className="font-mono text-xs tracking-widest text-tone">
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
            <p className="font-mono text-xs tracking-widest text-tone shrink-0">
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

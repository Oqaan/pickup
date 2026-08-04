import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchSeriesDetail } from "../api";
import type { SeriesDetail } from "../types";

export default function SeriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!slug) return;
    fetchSeriesDetail(slug)
      .then(setSeries)
      .catch((e: Error) => setError(e.message));
  }, [slug]);

  if (error === "not-found") {
    return <p className="font-body p-8">No entry for "{slug}" yet.</p>;
  }
  if (error) {
    return <p className="font-body p-8">Something went wrong. Try again.</p>;
  }
  if (!series) {
    return (
      <main
        className="max-w-4xl mx-auto px-6 pt-12 sm:pt-20 pb-0"
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

  if (!current) {
    return (
      <p className="font-body p-8">
        We don't have the chapter details for {series.title} yet.
      </p>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 pt-12 sm:pt-20 pb-0">
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

      <div className="mt-12 sm:mt-16 pt-8 border-t border-tone">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 sm:items-start max-w-2xl">
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
      </div>

      {series.readingLinks.length > 0 && (
        <div className="mt-12 sm:mt-16 pt-8 border-t border-tone">
          <p className="font-mono text-xs tracking-widest text-tone">
            WHERE TO READ
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            {series.readingLinks.map((rl) => (
              <a
                key={rl.url}
                href={rl.url}
                target="_blank"
                rel="noreferrer"
                className="font-body text-sm px-4 py-2 border border-tone text-sumi hover:bg-sumi hover:border-sumi hover:text-paper transition"
              >
                {rl.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
      .then((data) => {
        setSeries(data);
        const lastReal = data.adaptations.findLastIndex(
          (a) => a.continueChapter !== null,
        );
        setSelected(lastReal >= 0 ? lastReal : data.adaptations.length - 1);
      })
      .catch((e: Error) => setError(e.message));
  }, [slug]);

  if (error === "not-found") {
    return <p className="font-body p-8">No entry for "{slug}" yet.</p>;
  }
  if (error) {
    return <p className="font-body p-8">Something went wrong. Try again.</p>;
  }
  if (!series) {
    return <p className="font-mono p-8 text-tone">Loading…</p>;
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
    <main className="max-w-2xl mx-auto px-6 pt-12 pb-0">
      <h1 className="font-display text-5xl text-sumi leading-none mt-8">
        {series.title}
      </h1>
      {series.titleNative && (
        <p className="font-mono text-xs text-tone mt-2">{series.titleNative}</p>
      )}

      <p className="font-mono text-xs tracking-widest text-tone mt-12">
        HOW FAR HAVE YOU WATCHED?
      </p>

      <div className="flex flex-wrap gap-2 mt-3">
        {series.adaptations.map((a, i) => (
          <button
            key={a.name}
            onClick={() => setSelected(i)}
            className={
              i === selected
                ? "font-body text-sm px-4 py-2 border border-sumi bg-sumi text-paper"
                : "font-body text-sm px-4 py-2 border border-tone text-sumi hover:border-sumi"
            }
          >
            {a.name}
          </button>
        ))}
      </div>

      <div className="mt-10 pt-8 border-t border-tone flex gap-8 items-start">
        <div className="flex-1 min-w-0">
          {current.continueChapter ? (
            <>
              {current.animeOriginal && (
                <p className="font-mono text-xs tracking-widest text-jump">
                  ANIME ORIGINAL STORY
                </p>
              )}
              <p className="font-mono text-xs tracking-widest text-tone">
                START READING AT
              </p>
              <p className="font-display text-7xl text-jump leading-none mt-2">
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
          <div className="w-40 shrink-0">
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
    </main>
  );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchSeriesDetail } from "../api";
import type { SeriesDetail } from "../types";

export default function SeriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    return <p className="font-mono p-8 text-tone">Loading…</p>;
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-5xl text-sumi leading-none">
        {series.title}
      </h1>
      {series.titleNative && (
        <p className="font-mono text-sm text-tone mt-2">{series.titleNative}</p>
      )}

      <div className="mt-16 space-y-12">
        {series.adaptations.map((a) => (
          <section key={a.name}>
            <p className="font-mono text-xs uppercase tracking-widest text-tone">
              {a.name}
              {a.episodes && ` · ${a.episodes} episodes`}
            </p>

            {a.continueChapter ? (
              <p className="font-display text-6xl text-jump leading-none mt-3">
                {a.continueChapter}
                <span className="font-body text-base text-sumi ml-3">
                  chapter
                  {a.continueVolume && ` · volume ${a.continueVolume}`}
                </span>
              </p>
            ) : (
              <p className="font-body text-lg text-sumi mt-3">
                Not a continuation point.
              </p>
            )}

            {a.notes && (
              <p className="font-body text-sm text-sumi/70 mt-3 max-w-prose">
                {a.notes}
              </p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}

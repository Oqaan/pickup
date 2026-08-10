import { useTitle } from "../useTitle";

export default function AboutPage() {
  useTitle("About - pickup");
  return (
    <main className="max-w-2xl mx-auto px-6 pt-16 pb-0">
      <h1 className="font-display text-title text-sumi">About pickup</h1>

      <div className="mt-10 space-y-6 font-body text-base text-sumi/80 leading-relaxed">
        <p>
          You finish a season, you want to keep going, and the manga is right
          there. The only problem is knowing where to open it. Adaptations
          rarely stop where a volume does, and searching for the answer usually
          lands you in a four year old forum thread where nobody agrees.
        </p>

        <p>
          So this site does the looking up. Pick a series, say how far you got,
          and you get a chapter number.
        </p>
      </div>

      <h2 className="font-display text-section text-sumi mt-16">
        How the data is made
      </h2>

      <div className="mt-6 space-y-6 font-body text-base text-sumi/80 leading-relaxed">
        <p>
          By hand, one series at a time. The episode list on a series wiki shows
          where each season ends, the final episode's page shows which chapters
          it covered, and the volume list turns that chapter into something you
          can actually buy.
        </p>

        <p>
          The messy cases are what make this worth building. Sometimes a finale
          animates five pages of a chapter and drops the rest. Sometimes a whole
          season goes its own way and covers nothing new at all. A single number
          can't say that, so those entries get a note instead of a confident
          wrong answer.
        </p>

        <p>
          Covers come from{" "}
          <a
            href="https://mangadex.org"
            target="_blank"
            rel="noreferrer"
            className="text-sumi hover:text-jump underline underline-offset-4"
          >
            MangaDex
          </a>
          . The reading numbers behind the ordering on the home page come from{" "}
          <a
            href="https://anilist.co"
            target="_blank"
            rel="noreferrer"
            className="text-sumi hover:text-jump underline underline-offset-4"
          >
            AniList
          </a>
          .
        </p>
      </div>

      <div className="mt-16 pt-8 border-t border-tone space-y-6 font-body text-base text-sumi/80 leading-relaxed">
        <p>
          The whole thing is open source, so if a number looks off or a series
          you want isn't here, say so on{" "}
          <a
            href="https://github.com/Oqaan/pickup"
            target="_blank"
            rel="noreferrer"
            className="text-sumi hover:text-jump underline underline-offset-4"
          >
            GitHub
          </a>{" "}
          or just{" "}
          <a
            href="mailto:hey@pickup.moe"
            className="text-sumi hover:text-jump underline underline-offset-4"
          >
            send a mail
          </a>
          .
        </p>
      </div>
    </main>
  );
}

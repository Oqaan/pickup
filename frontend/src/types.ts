export type Adaptation = {
  name: string;
  episodes: number | null;
  continueChapter: number | null;
  continueVolume: number | null;
  lastCoveredChapter: number | null;
  animeOriginal: boolean;
  caughtUp: boolean;
  notes: string | null;
  coverUrl: string | null;
};

export type SeriesDetail = {
  slug: string;
  title: string;
  titleNative: string | null;
  coverUrl: string | null;
  notes: string | null;
  readingLinks: ReadingLink[]
  adaptations: Adaptation[];
};

export type SeriesSummary = {
  slug: string;
  title: string;
  coverUrl: string | null;
  aliases: string[];
};

export type ReadingLink = {
  label: string;
  url: string;
};

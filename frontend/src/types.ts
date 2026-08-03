export type Adaptation = {
  name: string;
  episodes: number | null;
  continueChapter: number | null;
  continueVolume: number | null;
  lastCoveredChapter: number | null;
  animeOriginal: boolean;
  notes: string | null;
  coverUrl: string | null
};

export type SeriesDetail = {
  slug: string;
  title: string;
  titleNative: string | null;
  coverUrl: string | null;
  adaptations: Adaptation[];
};

export type SeriesSummary = {
  slug: string;
  title: string;
  coverUrl: string | null;
  aliases: string[]
};

package dev.okanaltun.pickup.seed;

import java.util.List;

public record SeedSeries(
                String slug,
                String title,
                String titleNative,
                String coverUrl,
                String notes,
                List<SeedAdaptation> adaptations,
                Integer anilistId,
                Integer popularity,
                String mangadexId,
                List<String> aliases,
                List<SeedReadingLink> readingLinks) {

        public record SeedAdaptation(
                        String name,
                        Integer episodes,
                        Integer sortOrder,
                        Integer continueChapter,
                        Integer continueVolume,
                        Integer lastCoveredChapter,
                        Boolean animeOriginal,
                        Boolean caughtUp,
                        String coverUrl,
                        String notes) {
        }

        public record SeedReadingLink(
                        String label,
                        String url,
                        Integer sortOrder) {
        }
}
package dev.okanaltun.pickup.seed;

import java.util.List;

public record SeedSeries(
                String slug,
                String title,
                String titleNative,
                String coverUrl,
                List<SeedAdaptation> adaptations,
                Integer popularity,
                String mangadexId) {

        public record SeedAdaptation(
                        String name,
                        Integer episodes,
                        Integer sortOrder,
                        Integer continueChapter,
                        Integer continueVolume,
                        Integer lastCoveredChapter,
                        Boolean animeOriginal,
                        String coverUrl,
                        String notes) {
        }
}
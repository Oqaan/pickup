package dev.okanaltun.pickup.series.dto;

import java.util.List;

public record SeriesSummaryResponse(
                String slug,
                String title,
                String coverUrl,
                List<String> aliases,
                long addedOrder,
                NewSeasonResponse newSeason,
                String titleNative,
                String publicationStatus,
                Integer totalChapters,
                Integer totalVolumes,
                int adaptationCount,
                boolean caughtUp) {
}

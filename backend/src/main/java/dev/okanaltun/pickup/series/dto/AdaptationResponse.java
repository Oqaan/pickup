package dev.okanaltun.pickup.series.dto;

public record AdaptationResponse(
                String name,
                Integer episodes,
                Integer episodeStart,
                Integer episodeEnd,
                Integer continueChapter,
                Integer continueVolume,
                Integer lastCoveredChapter,
                boolean animeOriginal,
                boolean caughtUp,
                String notes,
                String coverUrl) {
}
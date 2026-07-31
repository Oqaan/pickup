package dev.okanaltun.pickup.series.dto;

public record AdaptationResponse(
        String name,
        Integer episodes,
        Integer continueChapter,
        Integer continueVolume,
        Integer lastCoveredChapter,
        boolean animeOriginal,
        String notes) {
}
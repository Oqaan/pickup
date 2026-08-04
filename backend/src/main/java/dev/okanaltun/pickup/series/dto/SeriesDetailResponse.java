package dev.okanaltun.pickup.series.dto;

import java.util.List;

public record SeriesDetailResponse(
        String slug,
        String title,
        String titleNative,
        String coverUrl,
        String notes,
        String author,
        Integer startYear,
        String publicationStatus,
        Integer totalChapters,
        Integer totalVolumes,
        List<AdaptationResponse> adaptations,
        List<ReadingLinkResponse> readingLinks) {
}
package dev.okanaltun.pickup.series.dto;

import java.time.LocalDate;
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
        LocalDate verifiedAt,
        List<String> aliases,
        List<AdaptationResponse> adaptations,
        List<ReadingLinkResponse> readingLinks) {
}
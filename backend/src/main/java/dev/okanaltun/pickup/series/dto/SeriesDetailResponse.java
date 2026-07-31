package dev.okanaltun.pickup.series.dto;

import java.util.List;

public record SeriesDetailResponse(
        String slug,
        String title,
        String titleNative,
        String coverUrl,
        List<AdaptationResponse> adaptations) {
}
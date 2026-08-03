package dev.okanaltun.pickup.series.dto;

import java.util.List;

public record SeriesSummaryResponse(
                String slug,
                String title,
                String coverUrl,
                List<String> aliases) {
}

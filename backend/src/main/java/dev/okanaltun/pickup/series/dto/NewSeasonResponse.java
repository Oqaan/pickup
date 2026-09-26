package dev.okanaltun.pickup.series.dto;

import java.time.LocalDate;

public record NewSeasonResponse(
                String name,
                LocalDate addedAt,
                String coverUrl) {
}

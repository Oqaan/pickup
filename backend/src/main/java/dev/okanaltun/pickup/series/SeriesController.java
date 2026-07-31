package dev.okanaltun.pickup.series;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import dev.okanaltun.pickup.series.dto.*;

@RestController
@RequestMapping("/api/series")
public class SeriesController {

    private final SeriesService service;

    public SeriesController(SeriesService service) {
        this.service = service;
    }

    @GetMapping
    public List<SeriesSummaryResponse> list() {
        return service.findAll();
    }

    @GetMapping("/{slug}")
    public SeriesDetailResponse detail(@PathVariable String slug) {
        return service.findBySlug(slug);
    }
}

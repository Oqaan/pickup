package dev.okanaltun.pickup.series;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import dev.okanaltun.pickup.series.dto.*;

@RestController
@RequestMapping("/api/series")
public class SeriesController {

    // Browsers may reuse an answer for five minutes, and for a day after that
    // show the stored one while fetching a fresh one in the background.
    // Entries are added by hand, so a slightly outdated list is fine
    private static final CacheControl CACHE = CacheControl.maxAge(5, TimeUnit.MINUTES)
            .cachePublic()
            .staleWhileRevalidate(Duration.ofHours(24));

    private final SeriesService service;

    public SeriesController(SeriesService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<SeriesSummaryResponse>> list() {
        return ResponseEntity.ok().cacheControl(CACHE).body(service.findAll());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<SeriesDetailResponse> detail(@PathVariable String slug) {
        return ResponseEntity.ok().cacheControl(CACHE).body(service.findBySlug(slug));
    }
}

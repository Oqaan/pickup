package dev.okanaltun.pickup.seed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import dev.okanaltun.pickup.series.Adaptation;
import dev.okanaltun.pickup.series.Series;
import dev.okanaltun.pickup.series.SeriesRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
public class SeedRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(SeedRunner.class);

    private final SeriesRepository seriesRepository;

    public SeedRunner(SeriesRepository seriesRepository) {
        this.seriesRepository = seriesRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Only seed an empty database; slug is unique and a second run would violate the constraint
        if (seriesRepository.count() > 0) {
            logger.info("Seed skipped, database already contains {} series", seriesRepository.count());
            return;
        }

        ObjectMapper mapper = new ObjectMapper(new YAMLFactory());

        try (InputStream in = new ClassPathResource("seed/series.yaml").getInputStream()) {
            // Type erasure: List<SeedSeries>.class doesn't exist, so the type is built at runtime
            List<SeedSeries> entries = mapper.readValue(in, mapper.getTypeFactory()
                    .constructCollectionType(List.class, SeedSeries.class));

            for (SeedSeries entry : entries) {
                seriesRepository.save(toEntity(entry));
            }

            logger.info("Seeded {} series", entries.size());
        }
    }

    private Series toEntity(SeedSeries entry) {
        Series series = new Series();
        series.setSlug(entry.slug());
        series.setTitle(entry.title());
        series.setTitleNative(entry.titleNative());
        series.setCoverUrl(entry.coverUrl());
        series.setPopularity(entry.popularity() != null ? entry.popularity() : 0);

        if (entry.adaptations() != null) {
            for (SeedSeries.SeedAdaptation a : entry.adaptations()) {
                Adaptation adaptation = new Adaptation();
                adaptation.setName(a.name());
                adaptation.setEpisodes(a.episodes());
                adaptation.setSortOrder(a.sortOrder() != null ? a.sortOrder() : 0);
                adaptation.setContinueChapter(a.continueChapter());
                adaptation.setContinueVolume(a.continueVolume());
                adaptation.setLastCoveredChapter(a.lastCoveredChapter());
                adaptation.setAnimeOriginal(Boolean.TRUE.equals(a.animeOriginal()));
                adaptation.setNotes(a.notes());
                // Adaptation owns the relationship; without setSeries() the series_id column stays null
                adaptation.setSeries(series);
                series.getAdaptations().add(adaptation);
            }
        }

        return series;
    }
}

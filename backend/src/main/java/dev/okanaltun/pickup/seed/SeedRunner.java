package dev.okanaltun.pickup.seed;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import dev.okanaltun.pickup.series.Adaptation;
import dev.okanaltun.pickup.series.Series;
import dev.okanaltun.pickup.series.SeriesAlias;
import dev.okanaltun.pickup.series.SeriesRepository;
import dev.okanaltun.pickup.series.ReadingLink;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
public class SeedRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(SeedRunner.class);

    private final SeriesRepository seriesRepository;

    public SeedRunner(SeriesRepository seriesRepository) {
        this.seriesRepository = seriesRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        ObjectMapper mapper = new ObjectMapper(new YAMLFactory());

        try (InputStream in = new ClassPathResource("seed/series.yaml").getInputStream()) {
            // Type erasure: List<SeedSeries>.class doesn't exist, so the type is built at
            // runtime
            List<SeedSeries> entries = mapper.readValue(in, mapper.getTypeFactory()
                    .constructCollectionType(List.class, SeedSeries.class));

            int inserted = 0;
            int updated = 0;

            for (SeedSeries entry : entries) {
                // The slug is the sync key, so an existing row is updated in place and keeps
                // its id instead of being replaced
                Optional<Series> existing = seriesRepository.findBySlug(entry.slug());

                if (existing.isPresent()) {
                    updateEntity(existing.get(), entry);
                    updated++;
                } else {
                    seriesRepository.save(toEntity(entry));
                    inserted++;
                }
            }

            // Series that vanished from the YAML stay in the database on purpose, an
            // accidental removal shouldn't wipe live data
            logger.info("Seed synced: {} inserted, {} updated", inserted, updated);
        }
    }

    private Series toEntity(SeedSeries entry) {
        Series series = new Series();
        applyFields(series, entry);
        applyChildren(series, entry);
        return series;
    }

    private void updateEntity(Series series, SeedSeries entry) {
        applyFields(series, entry);
        // orphanRemoval on the collections deletes the old child rows, so rebuilding
        // them from the YAML can't pile up duplicates
        series.getAdaptations().clear();
        series.getAliases().clear();
        series.getReadingLinks().clear();
        applyChildren(series, entry);
        seriesRepository.save(series);
    }

    private void applyFields(Series series, SeedSeries entry) {
        series.setSlug(entry.slug());
        series.setTitle(entry.title());
        series.setTitleNative(entry.titleNative());
        series.setCoverUrl(entry.coverUrl());
        series.setNotes(entry.notes());
        series.setAuthor(entry.author());
        series.setStartYear(entry.startYear());
        series.setPublicationStatus(entry.publicationStatus());
        series.setTotalChapters(entry.totalChapters());
        series.setTotalVolumes(entry.totalVolumes());
        series.setVerifiedAt(
                entry.verifiedAt() != null ? LocalDate.parse(entry.verifiedAt()) : null);
        series.setAnilistId(entry.anilistId());
        series.setPopularity(entry.popularity() != null ? entry.popularity() : 0);
        series.setMangadexId(entry.mangadexId());
    }

    private void applyChildren(Series series, SeedSeries entry) {
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
                adaptation.setCaughtUp(Boolean.TRUE.equals(a.caughtUp()));
                adaptation.setNotes(a.notes());
                adaptation.setCoverUrl(a.coverUrl());
                // Adaptation owns the relationship; without setSeries() the series_id column
                // stays null
                adaptation.setSeries(series);
                series.getAdaptations().add(adaptation);
            }
        }

        if (entry.aliases() != null) {
            for (String alias : entry.aliases()) {
                SeriesAlias a = new SeriesAlias();
                a.setAlias(alias);
                a.setSeries(series);
                series.getAliases().add(a);
            }
        }

        if (entry.readingLinks() != null) {
            for (SeedSeries.SeedReadingLink rl : entry.readingLinks()) {
                ReadingLink readingLink = new ReadingLink();
                readingLink.setLabel(rl.label());
                readingLink.setUrl(rl.url());
                readingLink.setSortOrder(rl.sortOrder() != null ? rl.sortOrder() : 0);
                readingLink.setSeries(series);
                series.getReadingLinks().add(readingLink);
            }
        }
    }
}

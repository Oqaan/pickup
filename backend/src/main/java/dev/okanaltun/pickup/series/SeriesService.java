package dev.okanaltun.pickup.series;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.okanaltun.pickup.series.dto.*;

@Service
public class SeriesService {

        private final SeriesRepository repository;
        private final ReadingLinkRepository readingLinkRepository;
        private final SeriesAliasRepository seriesAliasRepository;

        public SeriesService(SeriesRepository repository,
                        ReadingLinkRepository readingLinkRepository,
                        SeriesAliasRepository seriesAliasRepository) {
                this.repository = repository;
                this.readingLinkRepository = readingLinkRepository;
                this.seriesAliasRepository = seriesAliasRepository;
        }

        @Transactional(readOnly = true)
        public List<SeriesSummaryResponse> findAll() {
                return repository.findAllByOrderByPopularityDesc().stream()
                                .map(s -> new SeriesSummaryResponse(s.getSlug(), s.getTitle(), s.getCoverUrl(),
                                                s.getAliases().stream().map(SeriesAlias::getAlias).toList()))
                                .toList();
        }

        @Transactional(readOnly = true)
        public SeriesDetailResponse findBySlug(String slug) {
                Series series = repository.findBySlug(slug)
                                .orElseThrow(() -> new SeriesNotFoundException(slug));

                List<AdaptationResponse> adaptations = series.getAdaptations().stream()
                                .map(a -> new AdaptationResponse(
                                                a.getName(),
                                                a.getEpisodes(),
                                                a.getContinueChapter(),
                                                a.getContinueVolume(),
                                                a.getLastCoveredChapter(),
                                                a.isAnimeOriginal(),
                                                a.isCaughtUp(),
                                                a.getNotes(),
                                                a.getCoverUrl()))
                                .toList();

                // Fetched separately: Hibernate can't join two list collections in one query
                List<ReadingLinkResponse> readingLinks = readingLinkRepository
                                .findBySeriesIdOrderBySortOrder(series.getId()).stream()
                                .map(rl -> new ReadingLinkResponse(rl.getLabel(), rl.getUrl()))
                                .toList();

                List<String> aliases = seriesAliasRepository.findBySeriesId(series.getId()).stream()
                                .map(SeriesAlias::getAlias)
                                .toList();

                return new SeriesDetailResponse(
                                series.getSlug(),
                                series.getTitle(),
                                series.getTitleNative(),
                                series.getCoverUrl(),
                                series.getNotes(),
                                series.getAuthor(),
                                series.getStartYear(),
                                series.getPublicationStatus(),
                                series.getTotalChapters(),
                                series.getTotalVolumes(),
                                series.getVerifiedAt(),
                                aliases,
                                adaptations,
                                readingLinks);
        }
}

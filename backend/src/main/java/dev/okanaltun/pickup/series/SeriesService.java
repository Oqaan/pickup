package dev.okanaltun.pickup.series;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.okanaltun.pickup.series.dto.*;

@Service
public class SeriesService {

        private final SeriesRepository repository;
        private final ReadingLinkRepository readingLinkRepository;

        public SeriesService(SeriesRepository repository, ReadingLinkRepository readingLinkRepository) {
                this.repository = repository;
                this.readingLinkRepository = readingLinkRepository;
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
                                adaptations,
                                readingLinks);
        }
}

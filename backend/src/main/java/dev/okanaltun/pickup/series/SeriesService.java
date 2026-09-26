package dev.okanaltun.pickup.series;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.okanaltun.pickup.series.dto.*;

@Service
public class SeriesService {

        private final SeriesRepository repository;
        private final ReadingLinkRepository readingLinkRepository;
        private final SeriesAliasRepository seriesAliasRepository;
        private final AdaptationRepository adaptationRepository;

        public SeriesService(SeriesRepository repository,
                        ReadingLinkRepository readingLinkRepository,
                        SeriesAliasRepository seriesAliasRepository,
                        AdaptationRepository adaptationRepository) {
                this.repository = repository;
                this.readingLinkRepository = readingLinkRepository;
                this.seriesAliasRepository = seriesAliasRepository;
                this.adaptationRepository = adaptationRepository;
        }

        @Transactional(readOnly = true)
        public List<SeriesSummaryResponse> findAll() {
                // One query for every dated season instead of loading each series' seasons
                Map<Integer, Adaptation> newSeasons = adaptationRepository.findByAddedAtIsNotNull().stream()
                                .collect(Collectors.toMap(a -> a.getSeries().getId(), a -> a,
                                                (a, b) -> later(a, b) ? a : b));

                return repository.findAllByOrderByPopularityDesc().stream()
                                .map(s -> new SeriesSummaryResponse(s.getSlug(), s.getTitle(), s.getCoverUrl(),
                                                s.getAliases().stream().map(SeriesAlias::getAlias).toList(),
                                                s.getId(),
                                                newSeason(newSeasons.get(s.getId()))))
                                .toList();
        }

        private static boolean later(Adaptation a, Adaptation b) {
                int byDate = a.getAddedAt().compareTo(b.getAddedAt());
                return byDate != 0 ? byDate > 0 : a.getSortOrder() > b.getSortOrder();
        }

        private static NewSeasonResponse newSeason(Adaptation a) {
                return a == null ? null : new NewSeasonResponse(a.getName(), a.getAddedAt(), a.getCoverUrl());
        }

        @Transactional(readOnly = true)
        public SeriesDetailResponse findBySlug(String slug) {
                Series series = repository.findBySlug(slug)
                                .orElseThrow(() -> new SeriesNotFoundException(slug));

                List<AdaptationResponse> adaptations = series.getAdaptations().stream()
                                .map(a -> new AdaptationResponse(
                                                a.getName(),
                                                a.getEpisodes(),
                                                a.getEpisodeStart(),
                                                a.getEpisodeEnd(),
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

                List<RelatedSeriesResponse> related = resolveRelated(series.getRelated());

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
                                related,
                                adaptations,
                                readingLinks);
        }

        private List<RelatedSeriesResponse> resolveRelated(List<String> slugs) {
                if (slugs == null || slugs.isEmpty()) {
                        return List.of();
                }
                Map<String, Series> bySlug = repository.findBySlugIn(slugs).stream()
                                .collect(Collectors.toMap(Series::getSlug, s -> s));
                return slugs.stream()
                                .map(bySlug::get)
                                .filter(Objects::nonNull)
                                .map(s -> new RelatedSeriesResponse(s.getSlug(), s.getTitle(), s.getCoverUrl()))
                                .toList();
        }
}

package dev.okanaltun.pickup.series;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;
import java.util.Optional;

public interface SeriesRepository extends JpaRepository<Series, Integer> {

    @EntityGraph(attributePaths = "adaptations")
    Optional<Series> findBySlug(String slug);

    @EntityGraph(attributePaths = "aliases")
    List<Series> findAllByOrderByPopularityDesc();

    // Resolves the related slugs of a detail page to their titles and covers
    List<Series> findBySlugIn(List<String> slugs);
}

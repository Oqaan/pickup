package dev.okanaltun.pickup.series;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;
import java.util.Optional;

public interface SeriesRepository extends JpaRepository<Series, Integer> {

    @EntityGraph(attributePaths = "adaptations")
    Optional<Series> findBySlug(String slug);
    List<Series> findAllByOrderByPopularityDesc();
}

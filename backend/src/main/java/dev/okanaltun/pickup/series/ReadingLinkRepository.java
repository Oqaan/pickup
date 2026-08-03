package dev.okanaltun.pickup.series;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReadingLinkRepository extends JpaRepository<ReadingLink, Integer> {
    List<ReadingLink> findBySeriesIdOrderBySortOrder(Integer seriesId);
}
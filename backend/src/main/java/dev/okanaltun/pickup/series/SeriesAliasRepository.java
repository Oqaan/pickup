package dev.okanaltun.pickup.series;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SeriesAliasRepository extends JpaRepository<SeriesAlias, Integer> {
    List<SeriesAlias> findBySeriesId(Integer seriesId);
}
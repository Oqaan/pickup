package dev.okanaltun.pickup.series;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AdaptationRepository extends JpaRepository<Adaptation, Integer> {

    List<Adaptation> findByAddedAtIsNotNull();
}

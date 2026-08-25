package dev.okanaltun.pickup.series;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "adaptation")
@Getter
@Setter
public class Adaptation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "series_id")
    private Series series;

    @Column(nullable = false)
    private String name;

    private Integer episodes;

    @Column(name = "episode_start")
    private Integer episodeStart;

    @Column(name = "episode_end")
    private Integer episodeEnd;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;

    @Column(name = "continue_chapter")
    private Integer continueChapter;

    @Column(name = "continue_volume")
    private Integer continueVolume;

    @Column(name = "last_covered_chapter")
    private Integer lastCoveredChapter;

    @Column(name = "is_anime_original", nullable = false)
    private boolean animeOriginal = false;

    private String notes;

    @Column(name = "cover_url")
    private String coverUrl;

    @Column(name = "caught_up", nullable = false)
    private boolean caughtUp = false;

    public Adaptation() {
    }
}

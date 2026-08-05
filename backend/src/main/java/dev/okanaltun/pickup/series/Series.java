package dev.okanaltun.pickup.series;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "series")
@Getter
@Setter
public class Series {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(name = "title_native")
    private String titleNative;

    @Column(name = "cover_url")
    private String coverUrl;

    private String notes;

    private String author;

    @Column(name = "start_year")
    private Integer startYear;

    @Column(name = "publication_status")
    private String publicationStatus;

    @Column(name = "total_chapters")
    private Integer totalChapters;

    @Column(name = "total_volumes")
    private Integer totalVolumes;

    @Column(name = "anilist_id")
    private Integer anilistId;

    @Column(name = "mal_id")
    private Integer malId;

    @Column(name = "mangadex_id")
    private String mangadexId;

    @Column(nullable = false)
    private int popularity = 0;

    @Column(nullable = false)
    private String status = "published";

    @OneToMany(mappedBy = "series", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<Adaptation> adaptations = new ArrayList<>();

    @OneToMany(mappedBy = "series", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SeriesAlias> aliases = new ArrayList<>();

    @OneToMany(mappedBy = "series", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<ReadingLink> readingLinks = new ArrayList<>();

    public Series() {
    } // No-Args-Constructor
}

package dev.okanaltun.pickup.series;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "series_alias")
@Getter
@Setter
public class SeriesAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "series_id")
    private Series series;

    @Column(nullable = false)
    private String alias;

    public SeriesAlias() {
    }
}

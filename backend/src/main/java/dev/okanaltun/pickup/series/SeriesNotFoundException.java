package dev.okanaltun.pickup.series;

public class SeriesNotFoundException extends RuntimeException {
    public SeriesNotFoundException(String slug) {
        super("Series not found with slug: " + slug);
    }
}

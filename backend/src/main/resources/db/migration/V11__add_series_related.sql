-- Stored as slugs, not a foreign key, so the seed can reference a series before it exists
create table series_related (
  series_id    int not null references series(id) on delete cascade,
  related_slug text not null,
  sort_order   int not null,
  primary key (series_id, sort_order)
);

create index idx_series_related_series on series_related(series_id);

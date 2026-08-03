create table reading_link (
  id         serial primary key,
  series_id  int not null references series(id) on delete cascade,
  label      text not null,
  url        text not null,
  sort_order int not null default 0
);

create index idx_reading_link_series on reading_link(series_id);
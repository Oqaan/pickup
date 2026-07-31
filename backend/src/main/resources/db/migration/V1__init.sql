create table series (
  id           serial primary key,
  slug         text unique not null,
  title        text not null,
  title_native text,
  anilist_id   int unique,
  mal_id       int unique,
  cover_url    text,
  status       text not null default 'published'
);

create table series_alias (
  id        serial primary key,
  series_id int not null references series(id) on delete cascade,
  alias     text not null
);

create index idx_series_alias_series on series_alias(series_id);

create table adaptation (
  id                   serial primary key,
  series_id            int not null references series(id) on delete cascade,
  name                 text not null,
  episodes             int,
  sort_order           int not null default 0,
  continue_chapter     int,
  continue_volume      int,
  last_covered_chapter int,
  is_anime_original    boolean not null default false,
  notes                text
);

create index idx_adaptation_series on adaptation(series_id);

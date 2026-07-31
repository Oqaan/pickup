create table series (
  id        serial primary key,
  slug      text unique not null,
  title     text not null,
  cover_url text
);

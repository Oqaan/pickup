-- Two series can share a manga (Naruto and Shippuden adapt the same one),
-- so the anilist_id no longer needs to be unique.
alter table series drop constraint series_anilist_id_key;
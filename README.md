# pickup

Ever finished an anime and wondered where to continue in the manga?

Most anime adaptations don't cover the entire story, and figuring out where to continue usually means bouncing between Reddit threads and wiki pages. Pickup tells you exactly which chapter and volume to start from.

Live at [pickup.moe](https://pickup.moe)

![pickup home page](docs/home.jpg)

## How the data is put together

Every entry is added by hand. I don't scrape adaptation data. It's almost always wrong somewhere, and checking it by hand doesn't actually take that long.

For each season I:

* check where it ends on the series wiki,
* see which manga chapters the final episode adapted,
* and map those chapters back to their printed volume.

Not every anime ends neatly at the end of a chapter. Sometimes a finale only adapts half a chapter, and sometimes a series barely follows the manga at all. *Tokyo Ghoul √A* is the classic example. Whenever that happens, I leave a note instead of pretending there's a clean chapter to continue from.

Cover art comes from MangaDex and is re-hosted on Cloudinary. The popularity ordering comes from MyAnimeList member counts, blended so a series ranks by whichever medium it's bigger in, anime or manga. I still look up every ID manually because title searches tend to return spin-offs, one-shots, and alternate editions just as often as the series I actually want.

## Running it locally

Requirements:

* Docker
* Java 21
* Node

Start Postgres:

```
docker compose up -d
```

Run the backend:

```
cd backend && ./mvnw spring-boot:run
```

Run the frontend:

```
cd frontend && npm install && npm run dev
```

The frontend proxies anything under `/api` to the backend on port 8080, so there's nothing else to configure.

Seed data lives in `backend/src/main/resources/seed/series.yaml`. It's loaded automatically if the database is empty.

To wipe the database and reload everything:

```
docker compose down -v && docker compose up -d
```

## Adding a series

Add a new entry to `series.yaml`, then from the project root run:

```
node scripts/fetch-covers.mjs
node scripts/fetch-series-info.mjs
```

Both scripts print the values you need to paste back into the file. They intentionally don't modify it themselves, since that would strip comments and formatting. Pass `--all` if you want to refresh every entry instead of only the missing ones.

Popularity is its own step: add the new slug with its MyAnimeList anime and manga IDs to `scripts/mal-ids.json`, then run `node scripts/fetch-popularity.mjs`. It scrapes MAL member counts and rewrites every entry's `popularity` in place (the ordering is normalised across the whole set, so all entries get rewritten, not just the new one).

Once the MangaDex cover URLs are in place, move them to Cloudinary so the site isn't hotlinking someone else's servers:

```
CLOUDINARY_URL=cloudinary://key:secret@cloud node scripts/upload-covers.mjs
```

This one does rewrite `series.yaml` in place, swapping each MangaDex URL for a Cloudinary one. It keeps comments and formatting intact by editing line by line.

AniList's chapter and volume counts often include one-shots, bonus chapters, and other extras. They're useful as a starting point, but I still check finished series against the wiki before trusting the numbers.

## How it's built

The backend is Spring Boot with PostgreSQL. Flyway manages the database schema, while the frontend is built with React, TypeScript, Tailwind CSS, and Fuse.js for search.

A few implementation details that aren't obvious from the code:

* Flyway owns the schema. Hibernate only validates it at startup. Schema changes always go into new migration files. Old migrations stay untouched once they've been committed.
* Database entities never leave the service layer. Every API response has its own DTO, which keeps the API stable even if the database changes and avoids a bunch of lazy-loading headaches.
* Reading links and aliases are loaded in separate queries instead of joining everything together. JPA doesn't handle fetching multiple collection relationships in a single query very gracefully, so splitting them up keeps things predictable.

## Notes

Pickup doesn't host manga or link to unofficial scans.

Cover art originates from MangaDex and is served through Cloudinary, and whenever official reading platforms are available, those are linked instead.

If you spot an incorrect chapter or a missing series, feel free to open an issue.

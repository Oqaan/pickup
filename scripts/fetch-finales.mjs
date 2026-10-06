// Prints which anime in the catalog are airing, when their finales land and
// which seasons finished recently. Pass --days N to widen the window (default 30).

import { readFileSync } from "node:fs";
import { parse } from "yaml";

const YAML_PATH = "backend/src/main/resources/seed/series.yaml";
const API = "https://graphql.anilist.co";
const DAY = 86_400_000;
const FORMATS = ["TV", "TV_SHORT", "ONA", "MOVIE", "SPECIAL"];

const QUERY = `query($ids: [Int]) {
  Page(perPage: 50) {
    media(id_in: $ids, type: MANGA) {
      id
      relations {
        edges {
          node {
            type
            format
            status
            episodes
            endDate { year month day }
            nextAiringEpisode { episode airingAt }
            title { english romaji }
          }
        }
      }
    }
  }
}`;

const daysArg = process.argv.indexOf("--days");
const days = daysArg > -1 ? Number(process.argv[daysArg + 1]) : 30;
const now = Date.now();
const series = parse(readFileSync(YAML_PATH, "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fmt = (ms) => new Date(ms).toISOString().slice(0, 10);

const byManga = new Map();
for (let i = 0; i < series.length; i += 50) {
  const ids = series.slice(i, i + 50).map((s) => s.anilistId).filter(Boolean);
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "pickup-scripts",
    },
    body: JSON.stringify({ query: QUERY, variables: { ids } }),
  });
  if (!res.ok) {
    console.log(`request failed with ${res.status}`);
    process.exit(1);
  }
  for (const m of (await res.json()).data.Page.media) byManga.set(m.id, m);
  await sleep(1000);
}

const airing = [];
const finished = [];

for (const s of series) {
  const anime = (byManga.get(s.anilistId)?.relations.edges ?? [])
    .map((e) => e.node)
    .filter((n) => n.type === "ANIME" && FORMATS.includes(n.format));
  const lastAdded = (s.adaptations ?? [])
    .map((a) => a.addedAt)
    .filter(Boolean)
    .sort()
    .at(-1);

  for (const a of anime) {
    const title = a.title.english ?? a.title.romaji;

    if (a.status === "RELEASING" && a.nextAiringEpisode) {
      const next = a.nextAiringEpisode;
      // AniList only knows the next airing, so the finale assumes a weekly slot
      const finale = a.episodes
        ? next.airingAt * 1000 + (a.episodes - next.episode) * 7 * DAY
        : null;
      airing.push({ slug: s.slug, title, finale, next, episodes: a.episodes });
    }

    if (a.status === "FINISHED" && a.endDate?.year) {
      const { year, month, day } = a.endDate;
      const ended = Date.UTC(year, (month ?? 1) - 1, day ?? 1);
      if (now - ended > days * DAY) continue;
      // A season added on or after its finale is already in the catalog
      const done = lastAdded && lastAdded >= fmt(ended);
      finished.push({ slug: s.slug, title, ended, done });
    }
  }
}

airing.sort((a, b) => (a.finale ?? Infinity) - (b.finale ?? Infinity));
finished.sort((a, b) => b.ended - a.ended);

console.log(`\nAIRING NOW`);
for (const a of airing) {
  const when = a.finale
    ? `finale ~${fmt(a.finale)}${a.finale - now < days * DAY ? "  <- soon" : ""}`
    : `finale unknown, ep ${a.next.episode} on ${fmt(a.next.airingAt * 1000)}`;
  console.log(`  ${a.slug.padEnd(40)} ${when}  ${a.title}`);
}

console.log(`\nFINISHED IN THE LAST ${days} DAYS`);
for (const f of finished) {
  const state = f.done ? "in catalog" : "TO ADD";
  console.log(
    `  ${f.slug.padEnd(40)} ended ${fmt(f.ended)}  ${state.padEnd(10)}  ${f.title}`,
  );
}

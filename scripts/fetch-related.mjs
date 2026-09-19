// Computes thematic "related" series from AniList genres + tags and writes a
// `related: [slugs]` list into each series.yaml entry. Re-run after adding a
// series so it feeds into the others' related lists. Similarity is
// shared genres + shared non-spoiler tags weighted by rank, plus a same-author
// bonus. Only genuinely overlapping series are kept (no popularity filler), so
// a thin entry can end up with fewer than the cap. Run from scripts/:
//   node fetch-related.mjs         (uses cached AniList data if present)
//   node fetch-related.mjs --refetch   (re-pulls from AniList)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { parseDocument, parse } from "yaml";

const YAML_PATH = "../backend/src/main/resources/seed/series.yaml";
const CACHE = "/tmp/anilist-related-cache.json";
const API = "https://graphql.anilist.co";
const CAP = 5; // Most related series shown per entry
const MIN_SCORE = 6; // Below this the overlap is too weak to call "related"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const refetch = process.argv.includes("--refetch");

const QUERY = `query($id: Int) {
  Media(id: $id, type: MANGA) {
    genres
    tags { name rank isMediaSpoiler }
  }
}`;

const series = parse(readFileSync(YAML_PATH, "utf8"));

// AniList responses are cached so tuning the scoring doesn't re-hit the API
let cache = {};
if (!refetch && existsSync(CACHE)) {
  cache = JSON.parse(readFileSync(CACHE, "utf8"));
}

// AniList throttles hard (HTTP 429 with a Retry-After); wait it out and retry
// the same entry rather than dropping it
async function fetchMedia(id) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { id } }),
    });
    if (res.status === 429) {
      const wait = (Number(res.headers.get("retry-after")) || 60) + 1;
      console.log(`  rate limited, waiting ${wait}s`);
      await sleep(wait * 1000);
      continue;
    }
    if (!res.ok) return { error: res.status };
    return { media: (await res.json()).data?.Media };
  }
  return { error: "gave up after retries" };
}

for (const s of series) {
  if (!s.anilistId || cache[s.slug]) continue;
  const { media, error } = await fetchMedia(s.anilistId);
  if (error) {
    console.log(`${s.slug}: request failed ${error}`);
    continue;
  }
  if (!media) {
    console.log(`${s.slug}: no data`);
    continue;
  }
  cache[s.slug] = { genres: media.genres ?? [], tags: media.tags ?? [] };
  console.log(`fetched ${s.slug}`);
  writeFileSync(CACHE, JSON.stringify(cache));
  await sleep(2000);
}

// Only tags that are actually characteristic, and never spoiler tags (they'd
// match series on plot twists the reader hasn't seen yet)
const tagMap = (entry) => {
  const m = new Map();
  for (const t of entry.tags ?? []) {
    if (t.isMediaSpoiler || t.rank < 60) continue;
    m.set(t.name, t.rank);
  }
  return m;
};

const prepared = series
  .filter((s) => cache[s.slug])
  .map((s) => ({
    slug: s.slug,
    author: (s.author ?? "").trim().toLowerCase(),
    genres: new Set(cache[s.slug].genres),
    tags: tagMap(cache[s.slug]),
  }));

// Inverse document frequency: a genre or tag shared by half the catalogue
// (Action, Male Protagonist) says almost nothing, one shared by a handful
// (Sports, Time Travel, Cooking) says a lot. Weight the overlap by how rare
// the shared trait is across our own set, so matches are distinctive, not just
// "both are popular shounen"
const N = prepared.length;
const df = new Map();
const bump = (k) => df.set(k, (df.get(k) ?? 0) + 1);
for (const p of prepared) {
  for (const g of p.genres) bump(`g:${g}`);
  for (const name of p.tags.keys()) bump(`t:${name}`);
}
const idf = (k) => Math.log(N / (df.get(k) ?? N));

function score(a, b) {
  let sc = 0;
  for (const g of a.genres) if (b.genres.has(g)) sc += idf(`g:${g}`) * 3;
  for (const [name, ra] of a.tags) {
    const rb = b.tags.get(name);
    if (rb) sc += idf(`t:${name}`) * (Math.min(ra, rb) / 100) * 3;
  }
  // Same mangaka: almost certainly worth showing
  if (a.author && b.author && a.author === b.author) sc += 8;
  return sc;
}

const relatedBySlug = {};
for (const a of prepared) {
  const ranked = prepared
    .filter((b) => b.slug !== a.slug)
    .map((b) => ({ slug: b.slug, sc: score(a, b) }))
    .filter((x) => x.sc >= MIN_SCORE)
    .sort((x, y) => y.sc - x.sc)
    .slice(0, CAP);
  relatedBySlug[a.slug] = ranked.map((x) => x.slug);
  console.log(
    `${a.slug} -> ${ranked.map((x) => `${x.slug}(${x.sc.toFixed(1)})`).join(", ") || "(none)"}`,
  );
}

// Write back through the Document API so comments and the file's own quoting
// and flow style survive untouched, only the related key changes
const doc = parseDocument(readFileSync(YAML_PATH, "utf8"));
for (const item of doc.contents.items) {
  const slug = item.get("slug");
  const related = relatedBySlug[slug];
  if (!related) continue;
  item.delete("related");
  if (!related.length) continue;
  const seq = doc.createNode(related);
  seq.flow = true; // one-line ["a", "b"] like aliases
  const pair = doc.createPair("related", seq);
  // Keep it readable: sit the key next to aliases near the top, not buried
  // after the adaptations block
  const anchor = ["aliases", "titleNative", "title"].find((k) =>
    item.items.some((p) => p.key.value === k),
  );
  const at = item.items.findIndex((p) => p.key.value === anchor);
  item.items.splice(at + 1, 0, pair);
}
writeFileSync(
  YAML_PATH,
  doc.toString({ lineWidth: 0, flowCollectionPadding: false }),
);
console.log("\nwrote related into series.yaml");

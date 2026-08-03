// Prints current AniList popularity for pasting into the series.yaml.
// The numbers change over time, so this is worth re-running from time to time.

import { readFileSync } from "node:fs";
import { parse } from "yaml";

const YAML_PATH = "backend/src/main/resources/seed/series.yaml";
const API = "https://graphql.anilist.co";

const QUERY = `query($id: Int) {
  Media(id: $id, type: MANGA) {
    title { romaji }
    popularity
  }
}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const series = parse(readFileSync(YAML_PATH, "utf8"));

for (const s of series) {
  if (!s.anilistId) {
    console.log(`${s.slug}: no anilistId, skipping`);
    continue;
  }

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { id: s.anilistId } }),
  });

  if (!res.ok) {
    console.log(`${s.slug}: request failed with ${res.status}`);
    continue;
  }

  const body = await res.json();
  const media = body.data?.Media;

  if (!media) {
    console.log(`${s.slug}: no data returned`);
    continue;
  }

  const diff = media.popularity - (s.popularity ?? 0);
  console.log(
    `${s.slug}: ${media.popularity} (${diff >= 0 ? "+" : ""}${diff})`,
  );

  await sleep(700);
}

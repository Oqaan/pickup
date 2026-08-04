// Prints manga metadata from AniList for pasting into series.yaml.
// Only fetches entries without data; pass --all to refresh everything.
// Chapter counts include extras and one-shots; verify against the series wiki
// before trusting them for finished series.

import { readFileSync } from "node:fs";
import { parse } from "yaml";

const YAML_PATH = "backend/src/main/resources/seed/series.yaml";
const API = "https://graphql.anilist.co";

// Chapters and volumes stay null while a series is still running.
const QUERY = `query($id: Int) {
  Media(id: $id, type: MANGA) {
    startDate { year }
    status
    chapters
    volumes
    staff(perPage: 10) {
      edges { role node { name { full } } }
    }
  }
}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const refreshAll = process.argv.includes("--all");
const series = parse(readFileSync(YAML_PATH, "utf8"));

for (const s of series) {
  if (!s.anilistId) {
    console.log(`${s.slug}: no anilistId, skipping`);
    continue;
  }

  if (!refreshAll && s.author) continue;

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { id: s.anilistId } }),
  });

  if (!res.ok) {
    console.log(`${s.slug}: request failed with ${res.status}`);
    continue;
  }

  const media = (await res.json()).data?.Media;

  if (!media) {
    console.log(`${s.slug}: no data returned`);
    continue;
  }

  // AniList doesn't sort staff by role, so the first entry is often an assistant
  // or a cover artist.
  const edges = media.staff?.edges ?? [];
  const story = edges.find((e) => /story/i.test(e.role ?? ""));
  const author = (story ?? edges[0])?.node?.name?.full ?? "";

  console.log(`\n${s.slug}`);
  console.log(`  author: ${author}`);
  console.log(`  startYear: ${media.startDate?.year ?? ""}`);
  console.log(`  publicationStatus: ${media.status ?? ""}`);
  console.log(`  totalChapters: ${media.chapters ?? ""}`);
  console.log(`  totalVolumes: ${media.volumes ?? ""}`);

  await sleep(700);
}

// Sets each series popularity from MyAnimeList "members" (scraped off the MAL
// page). Blend: the higher of its anime vs manga standing, each normalised to
// its own max, so anime hits and manga pillars both rank high. Drives sort
// order only, never shown raw. IDs come from mal-ids.json; re-run to refresh.

import { readFileSync, writeFileSync } from "node:fs";

const YAML_PATH = "backend/src/main/resources/seed/series.yaml";
const MAP_PATH = "scripts/mal-ids.json";
const MEMBERS_PATH = "scripts/mal-members.json"; // sidecar record of raw counts
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ids = JSON.parse(readFileSync(MAP_PATH, "utf8"));
const raw = readFileSync(YAML_PATH, "utf8");

// Scrape the "Members:" figure off a MAL anime/manga page.
async function members(type, id) {
  if (!id) return null;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 25000);
      const res = await fetch(`https://myanimelist.net/${type}/${id}`, {
        headers: { "User-Agent": UA },
        signal: ctl.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const html = await res.text();
        const m = html.match(/Members:<\/span>\s*([\d,]+)/);
        if (m) return Number(m[1].replace(/,/g, ""));
      }
    } catch {
      /* retry */
    }
    await sleep(2500);
  }
  return null;
}

const anime = {};
const manga = {};
for (const [slug, { anime: aid, manga: mid }] of Object.entries(ids)) {
  anime[slug] = await members("anime", aid);
  await sleep(1200);
  manga[slug] = await members("manga", mid);
  await sleep(1200);
  console.log(
    `${slug}: anime=${anime[slug] ?? "FAIL"} manga=${manga[slug] ?? "FAIL"}`,
  );
}

const maxA = Math.max(...Object.values(anime).filter(Boolean), 1);
const maxM = Math.max(...Object.values(manga).filter(Boolean), 1);

const blend = {};
for (const slug of Object.keys(ids)) {
  const a = anime[slug] ? anime[slug] / maxA : 0;
  const m = manga[slug] ? manga[slug] / maxM : 0;
  if (a === 0 && m === 0) continue; // both scrapes failed: leave value as-is
  blend[slug] = Math.round(Math.max(a, m) * 1_000_000);
}

// Rewrite the popularity line under each slug, leaving everything else intact.
const lines = raw.split("\n");
let cur = null;
let written = 0;
for (let i = 0; i < lines.length; i++) {
  const sm = lines[i].match(/^- slug:\s*(\S+)/);
  if (sm) {
    cur = sm[1];
    continue;
  }
  const pm = lines[i].match(/^(\s+popularity:\s*)\d+\s*$/);
  if (pm && cur && blend[cur] != null) {
    lines[i] = `${pm[1]}${blend[cur]}`;
    written++;
    cur = null;
  }
}
writeFileSync(YAML_PATH, lines.join("\n"));
writeFileSync(
  MEMBERS_PATH,
  JSON.stringify(
    Object.fromEntries(
      Object.keys(ids).map((s) => [s, { anime: anime[s], manga: manga[s] }]),
    ),
    null,
    2,
  ) + "\n",
);

const failed = Object.keys(ids).filter((s) => blend[s] == null);
console.log(`\nUpdated ${written} popularity values in ${YAML_PATH}.`);
if (failed.length) console.log(`Both scrapes failed (unchanged): ${failed.join(", ")}`);

// Prints cover URLs for pasting into series.yaml. It never writes the file:
// re-serialising would drop the comments and formatting.
// Grid thumbnails do fine at 512; detail pages get the full-size upload

import { readFileSync } from "node:fs";
import { parse } from "yaml";

const YAML_PATH = "backend/src/main/resources/seed/series.yaml";
const API = "https://api.mangadex.org";
const CDN = "https://uploads.mangadex.org/covers";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchCovers(mangadexId) {
  const res = await fetch(`${API}/cover?manga[]=${mangadexId}&limit=100`, {
    headers: { "User-Agent": "pickup.moe (github.com/Oqaan/pickup)" },
  });
  if (!res.ok) throw new Error(`MangaDex returned ${res.status}`);
  const body = await res.json();
  return body.data.map((c) => ({
    volume: c.attributes.volume,
    locale: c.attributes.locale,
    fileName: c.attributes.fileName,
  }));
}

function pick(covers, volume) {
  // MangaDex returns volume numbers as strings, the YAML has them as numbers
  const forVolume = covers.filter((c) => c.volume === String(volume));
  return (
    forVolume.find((c) => c.locale === "en") ??
    forVolume.find((c) => c.locale === "ja") ??
    null
  );
}

function url(mangadexId, cover, size = "512") {
  // The file name already ends in .jpg; the size is appended after it
  return size
    ? `${CDN}/${mangadexId}/${cover.fileName}.${size}.jpg`
    : `${CDN}/${mangadexId}/${cover.fileName}`
}

const series = parse(readFileSync(YAML_PATH, "utf8"));

for (const s of series) {
  if (!s.mangadexId) {
    console.log(`\n${s.slug}: no mangadexId, skipping`);
    continue;
  }

  const covers = await fetchCovers(s.mangadexId);
  console.log(`\n${s.slug}`);

  const first = pick(covers, 1);
  console.log(`  coverUrl: ${first ? url(s.mangadexId, first) : "not found"}`);

  for (const a of s.adaptations ?? []) {
    if (!a.continueVolume) continue;
    const cover = pick(covers, a.continueVolume);
    console.log(`  ${a.name} (vol ${a.continueVolume})`);
    console.log(
      `    coverUrl: ${cover ? url(s.mangadexId, cover, null) : "not found"}`,
    );
  }

  await sleep(300);
}

// Prints cover URLs for pasting into series.yaml. It never writes the file:
// re-serialising would drop the comments and formatting.
// Only fetches what's missing; pass --all to refresh everything.
// Grid thumbnails do fine at 512; detail pages get the full-size upload.

import { readFileSync } from "node:fs";
import { parse } from "yaml";

const YAML_PATH = "backend/src/main/resources/seed/series.yaml";
const API = "https://api.mangadex.org";
const CDN = "https://uploads.mangadex.org/covers";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Skip entries that already have data unless --all is passed
const refreshAll = process.argv.includes("--all");

async function fetchCovers(mangadexId) {
  const covers = [];
  for (let offset = 0; ; offset += 100) {
    const res = await fetch(
      `${API}/cover?manga[]=${mangadexId}&limit=100&offset=${offset}`,
      { headers: { "User-Agent": "pickup.moe (github.com/Oqaan/pickup)" } },
    );
    if (!res.ok) throw new Error(`MangaDex returned ${res.status}`);
    const body = await res.json();
    for (const c of body.data) {
      covers.push({
        volume: c.attributes.volume,
        locale: c.attributes.locale,
        fileName: c.attributes.fileName,
      });
    }
    if (offset + 100 >= body.total) return covers;
    await sleep(300);
  }
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
    : `${CDN}/${mangadexId}/${cover.fileName}`;
}

// A caught-up season has no next volume, so it shows the one the story ends in
function coverVolume(series, adaptation) {
  if (adaptation.continueVolume) return adaptation.continueVolume;
  if (adaptation.caughtUp && series.publicationStatus === "FINISHED") {
    return series.totalVolumes;
  }
  return null;
}

const series = parse(readFileSync(YAML_PATH, "utf8"));

for (const s of series) {
  if (!s.mangadexId) {
    console.log(`\n${s.slug}: no mangadexId, skipping`);
    continue;
  }

  const needsSeriesCover = refreshAll || !s.coverUrl;
  const missingAdaptations = (s.adaptations ?? [])
    .map((a) => ({ ...a, volume: coverVolume(s, a) }))
    .filter((a) => a.volume && (refreshAll || !a.coverUrl));

  if (!needsSeriesCover && missingAdaptations.length === 0) continue;

  const covers = await fetchCovers(s.mangadexId);
  console.log(`\n${s.slug}`);

  if (needsSeriesCover) {
    const first = pick(covers, 1);
    console.log(
      `  coverUrl: ${first ? url(s.mangadexId, first) : "not found"}`,
    );
  }

  for (const a of missingAdaptations) {
    const cover = pick(covers, a.volume);
    console.log(`  ${a.name} (vol ${a.volume})`);
    console.log(
      `    coverUrl: ${cover ? url(s.mangadexId, cover, null) : "not found"}`,
    );
  }

  await sleep(300);
}

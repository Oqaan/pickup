import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";

// Reads CLOUDINARY_URL from the environment automatically.
// Run with:
// CLOUDINARY_URL=cloudinary://key:secret@cloud node scripts/upload-covers.mjs

const SEED = "backend/src/main/resources/seed/series.yaml";
const FOLDER = "pickup/covers";

if (!process.env.CLOUDINARY_URL) {
  console.error("Missing CLOUDINARY_URL environment variable.");
  process.exit(1);
}

const text = readFileSync(SEED, "utf8");

// Work line by line so the YAML's comments and structure stay intact
const lines = text.split("\n");

let currentSlug = "series";
const uploads = [];

const slugRe = /^\s*-?\s*slug:\s*(\S+)/;
// Covers come from MangaDex, series it doesn't have covers for, such as
// webtoons, fall back to the images on their fandom wiki
const COVER_HOSTS = ["uploads.mangadex.org", "static.wikia.nocookie.net"];
const coverRe = new RegExp(
  `^(\\s*)coverUrl:\\s*(https://(?:${COVER_HOSTS.map((h) => h.replace(/\./g, "\\.")).join("|")})/\\S+)`,
);

lines.forEach((line, i) => {
  const slugMatch = line.match(slugRe);
  if (slugMatch) {
    currentSlug = slugMatch[1];
    return;
  }
  const coverMatch = line.match(coverRe);
  if (coverMatch) {
    // Naming covers after a hash of their source URL keeps the names unique no
    // matter what the URL itself looks like
    const shortHash = createHash("sha1")
      .update(coverMatch[2])
      .digest("hex")
      .slice(0, 11);
    const name = `${currentSlug}-${shortHash}`;
    uploads.push({
      lineIndex: i,
      indent: coverMatch[1],
      url: coverMatch[2],
      name,
    });
  }
});

console.log(`Found ${uploads.length} cover URLs to migrate.`);

for (const u of uploads) {
  try {
    // Cloudinary fetches the image from the source host itself
    const res = await cloudinary.uploader.upload(u.url, {
      public_id: u.name,
      folder: FOLDER,
      overwrite: true,
      resource_type: "image",
    });
    lines[u.lineIndex] = `${u.indent}coverUrl: ${res.secure_url}`;
    console.log(`  ok  ${u.name}`);
  } catch (err) {
    console.error(`  FAIL ${u.name}: ${err.message}`);
  }
}

writeFileSync(SEED, lines.join("\n"));
console.log("Wrote updated URLs back to the seed file.");

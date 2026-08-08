import { readFileSync, writeFileSync } from "node:fs";
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
const coverRe = /^(\s*)coverUrl:\s*(https:\/\/uploads\.mangadex\.org\/\S+)/;

lines.forEach((line, i) => {
  const slugMatch = line.match(slugRe);
  if (slugMatch) {
    currentSlug = slugMatch[1];
    return;
  }
  const coverMatch = line.match(coverRe);
  if (coverMatch) {
    const shortHash = coverMatch[2]
      .split("/")
      .pop()
      .slice(0, 12)
      .replace(/\W/g, "");
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
    // Cloudinary fetches the image from MangaDex itself
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

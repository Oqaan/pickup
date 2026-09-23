import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";

// Reads CLOUDINARY_URL from the environment automatically.
// Run with:
// CLOUDINARY_URL=cloudinary://key:secret@cloud node scripts/upload-covers.mjs
// Add --warm to rebuild the sizes of covers already on Cloudinary, only needed after changing EAGER

const warm = process.argv.includes("--warm");
const SEED = "backend/src/main/resources/seed/series.yaml";
const FOLDER = "pickup/covers";

// Pre-generate the widths cover.ts uses, so the first hit isn't an on-the-fly
// transform. No crop, to match the frontend's "f_auto,q_auto,w_<n>" URL
const EAGER = [200, 300, 400, 600].map((width) => ({
  width,
  quality: "auto",
  fetch_format: "auto",
}));

if (!process.env.CLOUDINARY_URL) {
  console.error("Missing CLOUDINARY_URL environment variable.");
  process.exit(1);
}

const text = readFileSync(SEED, "utf8");

// Work line by line so the YAML's comments and structure stay intact
const lines = text.split("\n");

let currentSlug = "series";
// Not yet migrated: upload from the source host. Already on Cloudinary: warm
const uploads = [];
const warms = [];

const slugRe = /^\s*-?\s*slug:\s*(\S+)/;
// Covers come from MangaDex, series it doesn't have covers for, such as
// webtoons, fall back to the images on their fandom wiki
const COVER_HOSTS = ["uploads.mangadex.org", "static.wikia.nocookie.net"];
const sourceRe = new RegExp(
  `^(\\s*)coverUrl:\\s*(https://(?:${COVER_HOSTS.map((h) => h.replace(/\./g, "\\.")).join("|")})/\\S+)`,
);
const cloudinaryRe = /^\s*coverUrl:\s*(https:\/\/res\.cloudinary\.com\/\S+)/;

lines.forEach((line, i) => {
  const slugMatch = line.match(slugRe);
  if (slugMatch) {
    currentSlug = slugMatch[1];
    return;
  }
  const sourceMatch = line.match(sourceRe);
  if (sourceMatch) {
    // Naming covers after a hash of their source URL keeps the names unique no
    // matter what the URL itself looks like
    const shortHash = createHash("sha1")
      .update(sourceMatch[2])
      .digest("hex")
      .slice(0, 11);
    uploads.push({
      lineIndex: i,
      indent: sourceMatch[1],
      url: sourceMatch[2],
      name: `${currentSlug}-${shortHash}`,
    });
    return;
  }
  const cloudinaryMatch = line.match(cloudinaryRe);
  if (warm && cloudinaryMatch) {
    // Public id = path after "/image/upload/", minus version prefix and extension
    const path = cloudinaryMatch[1].split("/image/upload/")[1];
    if (path) {
      const publicId = path
        .replace(/^v\d+\//, "")
        .replace(/\.[^./]+$/, "");
      warms.push({ publicId });
    }
  }
});

console.log(
  warm
    ? `Found ${uploads.length} covers to upload, ${warms.length} already on Cloudinary to warm.`
    : `Found ${uploads.length} covers to upload.`,
);

for (const u of uploads) {
  try {
    // Cloudinary fetches the image from the source host itself
    const res = await cloudinary.uploader.upload(u.url, {
      public_id: u.name,
      folder: FOLDER,
      overwrite: true,
      resource_type: "image",
      eager: EAGER,
    });
    lines[u.lineIndex] = `${u.indent}coverUrl: ${res.secure_url}`;
    console.log(`  uploaded  ${u.name}`);
  } catch (err) {
    console.error(`  FAIL upload ${u.name}: ${err.message}`);
  }
}

for (const w of warms) {
  try {
    // Regenerate the eager derivatives without re-fetching. Async so warming
    // hundreds of covers doesn't block the run
    await cloudinary.uploader.explicit(w.publicId, {
      type: "upload",
      resource_type: "image",
      eager: EAGER,
      eager_async: true,
    });
    console.log(`  warmed    ${w.publicId}`);
  } catch (err) {
    console.error(`  FAIL warm ${w.publicId}: ${err.message}`);
  }
}

writeFileSync(SEED, lines.join("\n"));
console.log("Wrote updated URLs back to the seed file.");

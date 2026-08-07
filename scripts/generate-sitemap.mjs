import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "yaml";

const DOMAIN = "https://pickup.moe";
const SEED = "backend/src/main/resources/seed/series.yaml";
const OUT = "frontend/public/sitemap.xml";

// Static routes that aren't derived from series data.
const staticPaths = ["/", "/about"];

const series = parse(readFileSync(SEED, "utf8"));
const seriesPaths = series.map((s) => `/anime/${s.slug}`);

const today = new Date().toISOString().slice(0, 10);
const allPaths = [...staticPaths, ...seriesPaths];

const urls = allPaths
  .map(
    (path) =>
      `  <url>\n    <loc>${DOMAIN}${path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`,
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(OUT, xml);
console.log(`Wrote ${allPaths.length} URLs to ${OUT}`);

import { readFileSync, writeFileSync } from "node:fs";
import { parse } from "yaml";

const DOMAIN = "https://pickup.moe";
const SEED = "backend/src/main/resources/seed/series.yaml";
const OUT = "frontend/public/sitemap.xml";

const asDate = (value) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : value || null;

const series = parse(readFileSync(SEED, "utf8"));
const verified = series.map((s) => asDate(s.verifiedAt)).filter(Boolean);

// The home page lists the series, so it changes whenever one of them does.
// About has no date at all rather than one nobody remembers to bump
const entries = [
  { path: "/", lastmod: verified.sort().at(-1) },
  { path: "/about" },
  ...series.map((s) => ({
    path: `/anime/${s.slug}`,
    lastmod: asDate(s.verifiedAt),
  })),
];

const urls = entries
  .map(({ path, lastmod }) => {
    const date = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
    return `  <url>\n    <loc>${DOMAIN}${path}</loc>${date}\n  </url>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync(OUT, xml);
console.log(`Wrote ${entries.length} URLs to ${OUT}`);

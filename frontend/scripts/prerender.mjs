// Writes a static HTML file per series into dist/ so crawlers get a real title,
// meta, canonical, social card and the actual answer as text without running the
// app. The bundle still loads and takes over for real visitors.
//
// Runs after `vite build`. Reads the same seed as the sitemap, so no backend needed.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { parse } from "yaml";

const ORIGIN = "https://pickup.moe";
const DEFAULT_IMAGE = `${ORIGIN}/og-default.png`;

// Resolve from this file so it doesn't matter where it's run from
const TEMPLATE = new URL("../dist/index.html", import.meta.url);
const DIST = new URL("../dist/", import.meta.url);
const SEED = new URL(
  "../../backend/src/main/resources/seed/series.yaml",
  import.meta.url,
);

// Swap everything between these markers in index.html for each page's head
const SEO_BLOCK = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/;

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Stop the payload from closing the <script> early
const escapeJson = (value) =>
  JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");

// --- wording, kept in step with src/seo.ts ---

const seriesTitle = (s) => `Where does the ${s.title} anime leave off? - pickup`;

function seriesDescription(s) {
  const stops = (s.adaptations ?? []).filter((a) => a.continueChapter != null);
  const last = stops[stops.length - 1];
  if (!last) {
    return `Finished the ${s.title} anime? pickup shows exactly which manga chapter to read next, checked by hand.`;
  }
  const volume =
    last.continueVolume != null ? `, volume ${last.continueVolume}` : "";
  return `Finished the ${s.title} anime? Continue the manga from chapter ${last.continueChapter}${volume}. Every stopping point is checked by hand.`;
}

// --- html fragments ---

function headBlock(s) {
  const url = `${ORIGIN}/anime/${s.slug}`;
  const title = seriesTitle(s);
  const description = seriesDescription(s);
  const image = s.coverUrl || DEFAULT_IMAGE;

  return `<!-- seo:start -->
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <!-- seo:end -->`;
}

// The visible answer for crawlers that don't run JS. The app wipes #root on
// mount, so visitors only glimpse it on a cold load.
function bodyContent(s) {
  const items = (s.adaptations ?? [])
    .map((a) => {
      if (a.continueChapter == null) {
        const note = a.notes ? escapeHtml(a.notes) : "see the notes on the page";
        return `<li><strong>${escapeHtml(a.name)}</strong>: ${note}</li>`;
      }
      const volume =
        a.continueVolume != null ? ` (volume ${a.continueVolume})` : "";
      const note = a.notes ? ` ${escapeHtml(a.notes)}` : "";
      return `<li><strong>${escapeHtml(a.name)}</strong>: continue the manga from chapter ${a.continueChapter}${volume}.${note}</li>`;
    })
    .join("");

  return `<main><h1>Where does the ${escapeHtml(s.title)} anime leave off?</h1>${
    s.notes ? `<p>${escapeHtml(s.notes)}</p>` : ""
  }<ul>${items}</ul><p><a href="/">Browse every series on pickup</a></p></main>`;
}

function structuredData(s) {
  const url = `${ORIGIN}/anime/${s.slug}`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "pickup", item: `${ORIGIN}/` },
      { "@type": "ListItem", position: 2, name: s.title, item: url },
    ],
  };
  return `<script type="application/ld+json">${escapeJson(breadcrumb)}</script>`;
}

// --- run ---

let series;
try {
  series = parse(readFileSync(SEED, "utf8"));
} catch (err) {
  // Don't break a frontend-only build with no backend checked out
  console.warn(`prerender: skipped, could not read seed (${err.message})`);
  process.exit(0);
}

const template = readFileSync(TEMPLATE, "utf8");
if (!SEO_BLOCK.test(template)) {
  throw new Error(
    "prerender: could not find the <!-- seo:start/end --> markers in dist/index.html",
  );
}

for (const s of series) {
  let html = template.replace(SEO_BLOCK, headBlock(s));
  html = html.replace("</head>", `    ${structuredData(s)}\n  </head>`);
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${bodyContent(s)}</div>`,
  );

  const dir = new URL(`anime/${s.slug}/`, DIST);
  mkdirSync(dir, { recursive: true });
  writeFileSync(new URL("index.html", dir), html);
}

console.log(`prerender: wrote ${series.length} series pages to dist/anime/`);

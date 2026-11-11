/// <reference types="node" />
import { getCache, next, waitUntil } from "@vercel/functions";

export const config = {
  // Every path without a file extension, so unknown ones get a real 404
  matcher: ["/((?!assets/|_vercel/|.*\\..*).*)"],
};

const API = "https://api.pickup.moe";

// Crawlers reach the API from a few shared Vercel addresses, so the key lets them skip the rate limit
const KEY = process.env.PICKUP_MIDDLEWARE_KEY;
const api = (path: string) =>
  fetch(`${API}${path}`, KEY ? { headers: { "X-Pickup-Key": KEY } } : {});

const FRESH_MS = 15 * 60_000;
const KEEP_SECONDS = 24 * 60 * 60;

type Kept = { path: string; at: number; data: unknown };
type Loaded<T> = { status: number; data: T | null };

const cache = () => getCache({ namespace: "pickup" });

async function kept(path: string): Promise<Kept | null> {
  try {
    const hit = (await cache().get(path)) as Kept | null;
    // Cache keys are short hashes, so make sure the entry is really this path
    return hit?.path === path ? hit : null;
  } catch {
    return null;
  }
}

async function keep(path: string, data: unknown) {
  try {
    const entry: Kept = { path, at: Date.now(), data };
    await cache().set(path, entry, { ttl: KEEP_SECONDS });
  } catch {
    // A page without the cache is only slower
  }
}

async function refresh<T>(path: string): Promise<Loaded<T>> {
  try {
    const res = await api(path);
    if (!res.ok) return { status: res.status, data: null };
    const data = (await res.json()) as T;
    waitUntil(keep(path, data));
    return { status: 200, data };
  } catch {
    return { status: 502, data: null };
  }
}

// Pages are built from the stored answer so they don't wait on the API. An old
// answer is still served once while a new one is fetched, also when the API is down
async function load<T>(path: string): Promise<Loaded<T>> {
  const hit = await kept(path);
  if (!hit) return refresh<T>(path);
  if (Date.now() - hit.at > FRESH_MS) waitUntil(refresh(path));
  return { status: 200, data: hit.data as T };
}

// Validated before it goes into a URL we fetch
const SLUG = /^[a-z0-9-]{1,100}$/;

type Adaptation = {
  name: string;
  episodes: number | null;
  continueChapter: number | null;
  continueVolume: number | null;
  lastCoveredChapter: number | null;
  caughtUp: boolean;
  notes: string | null;
};

type Related = { slug: string; title: string; coverUrl: string | null };

type Series = {
  title: string;
  author: string | null;
  startYear: number | null;
  publicationStatus: string;
  totalChapters: number | null;
  totalVolumes: number | null;
  coverUrl: string | null;
  related: Related[];
  adaptations: Adaptation[];
  readingLinks: { label: string; url: string }[];
};

type Listed = {
  slug: string;
  title: string;
  coverUrl: string | null;
  addedOrder?: number;
  newSeason?: unknown;
  titleNative?: string | null;
  publicationStatus?: string | null;
  totalChapters?: number | null;
  totalVolumes?: number | null;
  adaptationCount?: number;
  caughtUp?: boolean;
};

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// The < escape keeps a stray "</script>" in the data from closing the tag early
const ldScript = (data: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(
    /</g,
    "\\u003c",
  )}</script>`;

// Hand the series to the app as data, not code, so it doesn't open on a blank
// skeleton. A JSON island rather than an inline script, so the strict CSP
// (script-src 'self') lets it through. Same < escape as above
const seed = (series: Series) =>
  `<script type="application/json" id="__pickup__">${JSON.stringify(
    series,
  ).replace(/</g, "\\u003c")}</script>`;

// The app reads this back off the page. It's data, not a script, so it's allowed
const island = (id: string, data: unknown) =>
  `<script type="application/json" id="${id}">${JSON.stringify(data).replace(
    /</g,
    "\\u003c",
  )}</script>`;

const listData = (list: Listed[]) =>
  list.map((s) => ({
    slug: s.slug,
    title: s.title,
    coverUrl: s.coverUrl,
    addedOrder: s.addedOrder,
    newSeason: s.newSeason,
    titleNative: s.titleNative,
    publicationStatus: s.publicationStatus,
    totalChapters: s.totalChapters,
    totalVolumes: s.totalVolumes,
    adaptationCount: s.adaptationCount,
    caughtUp: s.caughtUp,
  }));

// A protected preview deploy answers with Vercel's login page unless the visitor's cookie comes along
const shell = (req: Request) =>
  fetch(new URL("/index.html", req.url), {
    headers: { cookie: req.headers.get("cookie") ?? "" },
  }).then((r) => r.text());

const respond = (html: string, status = 200, headers = {}) =>
  new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", ...headers },
  });

// The plain shell still carries the homepage's tags, so with a 200 Google would
// file the page as a homepage copy. A 503 makes it come back later, and the app
// still starts for visitors
const unavailable = async (req: Request) =>
  respond(await shell(req), 503, { "retry-after": "300" });

// index.html carries the homepage's tags. Left in, a page would have two
// canonicals and Google would drop it as a homepage copy
const withTags = (html: string, tags: string) =>
  html
    .replace(/<title>.*?<\/title>/s, "")
    .replace(/<meta\s+name="description"[^>]*>/s, "")
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gs, "")
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gs, "")
    .replace(/<link\s+rel="canonical"[^>]*>/gs, "")
    .replace("</head>", `${tags}</head>`);

const ABOUT_TITLE = "About - pickup";
const ABOUT_DESCRIPTION =
  "How pickup works: every anime to manga stopping point is checked by hand, one series at a time.";

const LEGAL_TITLE = "Legal - pickup";
const LEGAL_DESCRIPTION = "Imprint and privacy policy for pickup.moe.";

function pickup(a: Adaptation): string {
  if (a.caughtUp) {
    const upto = a.lastCoveredChapter
      ? ` through chapter ${a.lastCoveredChapter}`
      : "";
    return `you are caught up, the anime adapts the manga${upto}`;
  }
  if (a.continueChapter) {
    const vol = a.continueVolume ? ` in volume ${a.continueVolume}` : "";
    return `continue the manga from chapter ${a.continueChapter}${vol}`;
  }
  return "";
}

function statusClause(s: Series): string {
  if (s.publicationStatus === "FINISHED" && s.totalChapters) {
    const vol = s.totalVolumes ? ` across ${s.totalVolumes} volumes` : "";
    return `The manga is complete at ${s.totalChapters} chapters${vol}.`;
  }
  return "The manga is still ongoing.";
}

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/(.)\/$/, "$1");
  if (path === "/") return homepage(req);
  if (path === "/browse") return browsePage(req);
  if (path === "/about") return aboutPage(req);
  if (path === "/legal") return legalPage(req);
  if (path.startsWith("/anime/")) return seriesPage(url, req);
  return notFound(req);
}

// Seed #root with a crawlable list of every series, React clears it on mount
async function homepage(req: Request) {
  const [html, { data: list }] = await Promise.all([
    shell(req),
    load<Listed[]>("/api/series"),
  ]);

  if (!list) return next();

  const items = list
    .map((s) => `<li><a href="/anime/${esc(s.slug)}">${esc(s.title)}</a></li>`)
    .join("");

  const body = `<nav style="max-width:640px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif;line-height:1.6">
    <h1>Where to start the manga after the anime</h1>
    <p>Finished the anime and not sure where to pick up the manga? pickup gives you the exact chapter to start from, checked by hand for each series.</p>
    <ul>${items}</ul>
  </nav>`;

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: list.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://pickup.moe/anime/${s.slug}`,
      name: s.title,
    })),
  };

  // Lets Google offer a sitelinks search box. The target is the ?q= the
  // homepage reads on load, so a search Google links to actually filters
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "pickup",
    url: "https://pickup.moe/",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://pickup.moe/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return respond(
    html
      .replace(
        "</head>",
        `${ldScript(website)}${ldScript(itemList)}${island(
          "__pickup_list__",
          listData(list),
        )}</head>`,
      )
      .replace('<div id="root"></div>', `<div id="root">${body}</div>`),
  );
}

// One page linking to every series, so Google reaches them all by links, not just the sitemap
async function browsePage(req: Request) {
  const [html, { data: list }] = await Promise.all([
    shell(req),
    load<Listed[]>("/api/series"),
  ]);

  if (!list) return unavailable(req);

  const title = "All series on pickup";
  const description =
    "Every series pickup covers. Find the anime you finished and get the exact manga chapter and volume to continue from.";
  const pageUrl = "https://pickup.moe/browse";

  const items = list
    .map((s) => `<li><a href="/anime/${esc(s.slug)}">${esc(s.title)}</a></li>`)
    .join("");

  const body = `<main style="max-width:640px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif;line-height:1.6">
    <h1>${esc(title)}</h1>
    <p>${esc(description)}</p>
    <ul>${items}</ul>
  </main>`;

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: list.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://pickup.moe/anime/${s.slug}`,
      name: s.title,
    })),
  };

  const tags = `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(pageUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${esc(pageUrl)}" />
    ${ldScript(itemList)}
    ${island("__pickup_list__", listData(list))}
  `;

  return respond(
    withTags(html, tags).replace(
      '<div id="root"></div>',
      `<div id="root">${body}</div>`,
    ),
  );
}

// Static page, only the tags need to be its own
async function aboutPage(req: Request) {
  const html = await shell(req);
  const pageUrl = "https://pickup.moe/about";
  const tags = `
    <title>${esc(ABOUT_TITLE)}</title>
    <meta name="description" content="${esc(ABOUT_DESCRIPTION)}" />
    <link rel="canonical" href="${esc(pageUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(ABOUT_TITLE)}" />
    <meta property="og:description" content="${esc(ABOUT_DESCRIPTION)}" />
    <meta property="og:url" content="${esc(pageUrl)}" />
    <meta property="og:image" content="https://pickup.moe/og-default.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(ABOUT_TITLE)}" />
    <meta name="twitter:description" content="${esc(ABOUT_DESCRIPTION)}" />
  `;
  return respond(withTags(html, tags));
}

async function legalPage(req: Request) {
  const html = await shell(req);
  const tags = `
    <title>${esc(LEGAL_TITLE)}</title>
    <meta name="description" content="${esc(LEGAL_DESCRIPTION)}" />
    <link rel="canonical" href="https://pickup.moe/legal" />
    <meta name="robots" content="noindex" />
  `;
  return respond(withTags(html, tags));
}

// A real 404 so Google drops the address instead of indexing a homepage copy
async function notFound(req: Request) {
  const html = await shell(req);
  const tags = `
    <title>Not found - pickup</title>
    <meta name="robots" content="noindex" />
  `;
  return respond(withTags(html, tags), 404);
}

async function seriesPage(url: URL, req: Request) {
  const slug = url.pathname.replace("/anime/", "").replace(/\/$/, "");

  if (!SLUG.test(slug)) return notFound(req);

  const [html, { status, data: series }] = await Promise.all([
    shell(req),
    load<Series>(`/api/series/${encodeURIComponent(slug)}`),
  ]);

  if (status === 404) return notFound(req);
  if (!series) return unavailable(req);
  const related = series.related ?? [];

  const title = `Where to continue the ${series.title} manga`;
  const description = `Finished the ${series.title} anime? Find the exact chapter and volume to continue the manga from, for each season`;
  const image = series.coverUrl ?? "https://pickup.moe/og-default.jpg";
  const pageUrl = `https://pickup.moe/anime/${slug}`;

  // Seeded into #root for crawlers, React clears it and renders the real UI on mount
  const intro = `${series.title}${series.author ? ` by ${series.author}` : ""}${
    series.startYear ? `, ${series.startYear}` : ""
  }. ${statusClause(series)}`;

  const items = (series.adaptations ?? [])
    .map((a) => {
      const eps = a.episodes ? ` (${a.episodes} episodes)` : "";
      const sentence = pickup(a);
      const tail = sentence ? `: ${esc(cap(sentence))}.` : "";
      const note = a.notes ? ` ${esc(a.notes)}` : "";
      return `<li><strong>${esc(a.name)}</strong>${eps}${tail}${note}</li>`;
    })
    .join("");

  const links = series.readingLinks?.length
    ? `<p>Read the manga: ${series.readingLinks
        .map((l) => `<a href="${esc(l.url)}">${esc(l.label)}</a>`)
        .join(", ")}.</p>`
    : "";

  const more = related.length
    ? `<nav style="max-width:640px;margin:24px auto 0;padding:0 24px;font-family:system-ui,sans-serif;line-height:1.6">
    <h2>More series</h2>
    <ul>${related
      .map((s) => `<li><a href="/anime/${esc(s.slug)}">${esc(s.title)}</a></li>`)
      .join("")}</ul>
  </nav>`
    : "";

  const body = `<article style="max-width:640px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif;line-height:1.5">
    <h1>${esc(title)}</h1>
    <p>${esc(intro)}</p>
    <ul>${items}</ul>
    ${links}
  </article>${more}`;

  const faqAnswer = (series.adaptations ?? [])
    .map((a) => ({ a, s: pickup(a) }))
    .filter(({ s }) => s)
    .map(({ a, s }) => `After ${a.name}, ${s}.`)
    .join(" ");

  const questions = [];
  if (faqAnswer) {
    questions.push({
      "@type": "Question",
      name: `Where should I start the ${series.title} manga after the anime?`,
      acceptedAnswer: { "@type": "Answer", text: faqAnswer },
    });
  }
  questions.push({
    "@type": "Question",
    name: `Is the ${series.title} manga finished?`,
    acceptedAnswer: { "@type": "Answer", text: statusClause(series) },
  });

  const tags = `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(pageUrl)}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta property="og:url" content="${esc(pageUrl)}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${esc(image)}" />
    ${ldScript({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: questions,
    })}
    ${seed(series)}
  `;

  return respond(
    withTags(html, tags).replace(
      '<div id="root"></div>',
      `<div id="root">${body}</div>`,
    ),
  );
}

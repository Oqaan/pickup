import { next } from "@vercel/functions";

export const config = {
  matcher: "/anime/:slug*",
};

const API = "https://api.pickup.moe";

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

type Series = {
  title: string;
  author: string | null;
  startYear: number | null;
  publicationStatus: string;
  totalChapters: number | null;
  totalVolumes: number | null;
  coverUrl: string | null;
  adaptations: Adaptation[];
  readingLinks: { label: string; url: string }[];
};

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

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

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const slug = url.pathname.replace("/anime/", "").replace(/\/$/, "");

  if (!SLUG.test(slug)) return next();

  const [pageRes, seriesRes] = await Promise.all([
    fetch(new URL("/index.html", url.origin)),
    fetch(`${API}/api/series/${encodeURIComponent(slug)}`),
  ]);

  if (!seriesRes.ok) return next();

  const series = (await seriesRes.json()) as Series;
  let html = await pageRes.text();

  const title = `Where to continue the ${series.title} manga`;
  const description = `Finished the ${series.title} anime? Find the exact chapter and volume to continue the manga from, for each season`;
  const image = series.coverUrl ?? "";
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

  const body = `<article style="max-width:640px;margin:0 auto;padding:24px;font-family:system-ui,sans-serif;line-height:1.5">
    <h1>${esc(title)}</h1>
    <p>${esc(intro)}</p>
    <ul>${items}</ul>
    ${links}
  </article>`;

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

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions,
  };

  // The \u003c escape keeps a stray "</script>" in the data from closing the tag early
  const jsonLd = `<script type="application/ld+json">${JSON.stringify(
    faq,
  ).replace(/</g, "\\u003c")}</script>`;

  const tags = `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(pageUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta property="og:url" content="${esc(pageUrl)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${esc(image)}" />
    ${jsonLd}
  `;

  html = html
    .replace(/<title>.*?<\/title>/s, "")
    .replace(/<meta\s+name="description"[^>]*>/s, "")
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gs, "")
    .replace("</head>", `${tags}</head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

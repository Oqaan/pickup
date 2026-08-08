import { next } from "@vercel/functions";

export const config = {
  // only anime pages need custom tags, everything else goes straight through
  matcher: "/anime/:slug*",
};

const API = "https://api.pickup.moe";

export default async function middleware(request: Request) {
  const url = new URL(request.url);
  const slug = url.pathname.replace("/anime/", "").replace(/\/$/, "");

  // grab the html shell and the series data at the same time to save a round trip
  const [pageRes, seriesRes] = await Promise.all([
    fetch(new URL("/index.html", url.origin)),
    fetch(`${API}/api/series/${slug}`),
  ]);

  // unknown slug, let the app render its own not-found page
  if (!seriesRes.ok) return next();

  const series = await seriesRes.json();
  let html = await pageRes.text();

  const title = `Where to continue the ${series.title} manga`;
  const description = `Finished the ${series.title} anime? Find the exact chapter and volume to continue the manga from, for each season`;
  const image = series.coverUrl ?? "";
  const pageUrl = `https://pickup.moe/anime/${slug}`;

  // a stray quote or bracket in a title would break the markup, so neutralise them first
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const tags = `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta property="og:url" content="${esc(pageUrl)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${esc(image)}" />
  `;

  // drop the generic tags from index.html and slot the series-specific ones in before the head closes
  html = html
    .replace(/<title>.*?<\/title>/s, "")
    .replace(/<meta\s+name="description"[^>]*>/s, "")
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gs, "")
    .replace("</head>", `${tags}</head>`);

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

import { useEffect } from "react";

// Keeps the head in sync as you move between pages. Crawlers get the same tags
// baked into the static HTML by scripts/prerender.mjs, so this only runs once
// the app has taken over.

const ORIGIN = "https://pickup.moe";
const DEFAULT_DESCRIPTION =
  "Finished the anime? pickup tells you which manga chapter to start from, checked by hand for each series.";
const DEFAULT_IMAGE = `${ORIGIN}/og-default.png`;

export type Seo = {
  title: string;
  description?: string;
  // Path or absolute url, e.g. "/anime/one-piece"
  canonical?: string;
  image?: string;
  ogType?: string;
  noindex?: boolean;
};

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function absolute(url: string) {
  return url.startsWith("http") ? url : `${ORIGIN}${url}`;
}

export function useSeo({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image = DEFAULT_IMAGE,
  ogType = "website",
  noindex = false,
}: Seo) {
  useEffect(() => {
    const url = absolute(canonical ?? window.location.pathname);

    document.title = title;
    setMeta("name", "description", description);
    setLink("canonical", url);

    setMeta("property", "og:type", ogType);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", absolute(image));

    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);

    // The head persists across navigations, so remove it again, don't just add it
    if (noindex) setMeta("name", "robots", "noindex");
    else document.head.querySelector('meta[name="robots"]')?.remove();
  }, [title, description, canonical, image, ogType, noindex]);
}

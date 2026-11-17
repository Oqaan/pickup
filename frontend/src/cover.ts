// Covers are stored on Cloudinary at full upload size. Anything written right
// after "/image/upload/" resizes and converts them before they are sent
const MARKER = "/image/upload/";

// One URL at one width. "f_auto" picks a modern format like WebP or AVIF,
// "q_auto" a sensible quality, "w_400" resizes to 400 pixels wide
const at = (url: string, width: number) => {
  const cut = url.indexOf(MARKER);
  // Some other image host, nothing to add here
  if (cut === -1) return url;
  const head = url.slice(0, cut + MARKER.length);
  return `${head}f_auto,q_auto,w_${width}/${url.slice(cut + MARKER.length)}`;
};

// Attributes for an <img>, ready to spread. "sizes" tells the browser how wide
// the image lands on the page, so it downloads only the width it needs
export function cover(url: string, widths: number[], sizes: string) {
  return {
    src: at(url, widths[0]),
    srcSet: widths.map((w) => `${at(url, w)} ${w}w`).join(", "),
    sizes,
  };
}

// Loads a cover into the browser cache, so the real <img> later shows it at once
export function warmCover(url: string, widths: number[], sizes: string) {
  const img = new Image();
  const warmed = cover(url, widths, sizes);
  img.sizes = warmed.sizes;
  img.srcset = warmed.srcSet;
  img.src = warmed.src;
}

// Shared with the hover prefetch, so both ask for the same file
export const ANSWER_COVER_SIZES = "(min-width: 1024px) 288px, 176px";

import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cover } from "../cover";
import { prefetchSeriesDetail } from "../api";

const SIZES = "(min-width: 1024px) 210px, (min-width: 640px) 30vw, 42vw";

export type ShelfCard = {
  slug: string;
  to: string;
  title: string;
  coverUrl: string | null;
  tag?: string;
};

type Props = {
  label: string;
  title: string;
  cards: ShelfCard[];
  onOpen: () => void;
  className?: string;
};

function Arrow({
  dir,
  disabled,
  onClick,
}: {
  dir: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Scroll back" : "Scroll forward"}
      className="w-9 h-9 flex items-center justify-center border border-tone text-sumi hover:border-sumi hover:text-jump disabled:text-tone disabled:border-tone/50 disabled:cursor-default cursor-pointer transition"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="square"
        aria-hidden="true"
      >
        <path d={dir === "left" ? "M15 5L8 12L15 19" : "M9 5L16 12L9 19"} />
      </svg>
    </button>
  );
}

export default function Shelf({
  label,
  title,
  cards,
  onOpen,
  className,
}: Props) {
  const row = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const track = () => {
    const el = row.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  const scroll = (dir: 1 | -1) =>
    row.current?.scrollBy({
      left: dir * row.current.clientWidth,
      behavior: "smooth",
    });

  return (
    <section className={className}>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="font-mono text-xs tracking-widest text-jump">{label}</p>
          <h2 className="font-display text-notice text-sumi mt-3">{title}</h2>
        </div>
        {cards.length > 5 && (
          <div className="hidden lg:flex gap-2">
            <Arrow dir="left" disabled={atStart} onClick={() => scroll(-1)} />
            <Arrow dir="right" disabled={atEnd} onClick={() => scroll(1)} />
          </div>
        )}
      </div>
      {/* The top padding leaves room for the hover lift, the row clips anything above it */}
      <div
        ref={row}
        onScroll={track}
        className="flex gap-x-6 mt-2 pt-2 -mx-6 px-6 scroll-px-6 lg:ml-[-0.5rem] lg:mr-0 lg:pl-2 lg:pr-0 lg:scroll-pl-2 lg:scroll-pr-0 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none]"
      >
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            onClick={onOpen}
            onPointerEnter={() => prefetchSeriesDetail(c.slug)}
            onFocus={() => prefetchSeriesDetail(c.slug)}
            className="group block shrink-0 w-[42%] sm:w-[30%] lg:w-[calc((100%-6rem)/5)] snap-start"
          >
            <div className="spine relative aspect-2/3 bg-tone/30 overflow-hidden ring-1 ring-transparent group-hover:ring-sumi transition duration-200 group-hover:-translate-y-1">
              {c.coverUrl && (
                <img
                  {...cover(c.coverUrl, [300, 600], SIZES)}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <p className="font-body text-sm text-sumi group-hover:text-jump mt-3 leading-snug">
              {c.title}
            </p>
            {c.tag && (
              <p className="font-mono text-xs tracking-widest text-jump mt-1">
                {c.tag}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

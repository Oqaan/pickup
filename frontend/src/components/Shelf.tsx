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

export default function Shelf({
  label,
  title,
  cards,
  onOpen,
  className,
}: Props) {
  return (
    <section className={className}>
      <p className="font-mono text-xs tracking-widest text-jump">{label}</p>
      <h2 className="font-display text-notice text-sumi mt-3">{title}</h2>
      <div className="flex lg:grid lg:grid-cols-5 gap-x-6 mt-4 -mx-6 px-6 scroll-px-6 lg:mx-0 lg:px-0 overflow-x-auto lg:overflow-visible snap-x snap-mandatory">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            onClick={onOpen}
            onPointerEnter={() => prefetchSeriesDetail(c.slug)}
            onFocus={() => prefetchSeriesDetail(c.slug)}
            className="group block shrink-0 w-[42%] sm:w-[30%] lg:w-auto snap-start"
          >
            <div className="spine relative aspect-2/3 bg-tone/30 overflow-hidden ring-1 ring-transparent group-hover:ring-sumi transition duration-200 group-hover:-translate-y-1">
              {c.coverUrl && (
                <img
                  {...cover(c.coverUrl, [300, 600], SIZES)}
                  alt=""
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

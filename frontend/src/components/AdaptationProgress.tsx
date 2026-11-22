import { motion, useReducedMotion } from "motion/react";
import CountUp from "./CountUp";

// How far into the manga a season reached: a percentage, a bar and the chapters
// still ahead

type Props = {
  covered: number;
  next: number;
  total: number;
  ends: (number | null)[];
  selected: number;
  ongoing: boolean;
  source: "manga" | "light novel";
  unit: "chapter" | "volume";
};

export default function AdaptationProgress({
  covered,
  next,
  total,
  ends,
  selected,
  ongoing,
  source,
  unit,
}: Props) {
  const reduceMotion = useReducedMotion();
  // Floor so it never claims 100% while a chapter is still left to read
  const pct = Math.min(100, Math.floor((covered / total) * 100));
  const left = Math.max(0, total - next + 1);
  const at = (value: number) =>
    `${(Math.min(Math.max(value, 0), total) / total) * 100}%`;

  // Each season runs from where the furthest earlier one stopped
  const segments = ends.flatMap((end, i) => {
    const start = Math.max(0, ...ends.slice(0, i).map((e) => e ?? 0));
    return end === null || end <= start ? [] : [{ i, start, end }];
  });

  return (
    <div className="mt-6 max-w-xs">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-xs tracking-widest text-ash">
          {source.toUpperCase()} ADAPTED
        </p>
        <p className="font-display text-section text-sumi leading-none">
          <CountUp value={pct} />%
        </p>
      </div>
      <motion.div
        className="relative mt-2 h-1.5 bg-tone/40"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Share of the ${source} the anime has adapted`}
        initial={{ clipPath: reduceMotion ? "inset(0 0 0 0)" : "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0 0 0)" }}
        transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.2, 0, 0, 1] }}
      >
        {segments.map(({ i, start, end }) => (
          <div
            key={i}
            className={`absolute inset-y-0 transition-colors duration-300 ${
              i < selected ? "bg-sumi" : i === selected ? "bg-jump" : "bg-tone"
            }`}
            style={{ left: at(start), width: at(end - start) }}
          />
        ))}
        {segments.slice(1).map(({ i, start }) => (
          <div
            key={`gap-${i}`}
            className="absolute -inset-y-px w-0.5 -ml-px bg-paper"
            style={{ left: at(start) }}
          />
        ))}
      </motion.div>
      <p className="font-mono text-xs text-ash mt-2">
        {left === 0 ? (
          "Nothing left to read"
        ) : (
          <>
            <CountUp value={left} /> {unit}
            {left === 1 ? "" : "s"} left
            {ongoing ? " so far" : ""}
          </>
        )}
      </p>
    </div>
  );
}

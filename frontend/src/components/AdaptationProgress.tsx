import { motion, useReducedMotion } from "motion/react";
import CountUp from "./CountUp";

// How far into the manga a season reached: a percentage, a bar and the chapters
// still ahead

type Props = {
  coveredChapter: number;
  continueChapter: number;
  totalChapters: number;
  ongoing: boolean;
};

export default function AdaptationProgress({
  coveredChapter,
  continueChapter,
  totalChapters,
  ongoing,
}: Props) {
  const reduceMotion = useReducedMotion();
  // Floor so it never claims 100% while a chapter is still left to read
  const pct = Math.min(100, Math.floor((coveredChapter / totalChapters) * 100));
  const left = Math.max(0, totalChapters - continueChapter + 1);

  return (
    <div className="mt-6 max-w-xs">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-xs tracking-widest text-ash">
          MANGA ADAPTED
        </p>
        <p className="font-display text-section text-sumi leading-none">
          <CountUp value={pct} />%
        </p>
      </div>
      <div
        className="mt-2 h-1.5 bg-tone/40 overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Share of the manga the anime has adapted"
      >
        <motion.div
          className="h-full bg-sumi"
          initial={{ width: reduceMotion ? `${pct}%` : 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            duration: reduceMotion ? 0 : 0.6,
            ease: [0.2, 0, 0, 1],
          }}
        />
      </div>
      <p className="font-mono text-xs text-ash mt-2">
        <CountUp value={left} /> chapter{left === 1 ? "" : "s"} left
        {ongoing ? " so far" : ""}
      </p>
    </div>
  );
}

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

// Counts up to a new number instead of jumping to it. The number is kept in a
// motion value, not in state, so counting doesn't re-render the whole page.
export default function CountUp({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(value);
  const rounded = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (reduceMotion) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, {
      duration: 0.6,
      ease: [0.2, 0, 0, 1],
    });
    return () => controls.stop();
  }, [value, count, reduceMotion]);
  return <motion.span className="tabular-nums">{rounded}</motion.span>;
}

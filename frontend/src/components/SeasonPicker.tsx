import { useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

type Props = {
  names: string[];
  selected: number;
  onPick: (index: number) => void;
};

const GLIDE = "cubic-bezier(0.2, 0, 0, 1)";
// Screentone dots, like the grey shading in a printed manga
const TONE =
  "bg-[radial-gradient(circle,rgb(20_17_15/0.28)_1.1px,transparent_1.4px)] bg-size-[6px_6px]";
const CELL =
  "font-body text-sm px-3 py-2 border text-center whitespace-nowrap";

export default function SeasonPicker({ names, selected, onPick }: Props) {
  const reduceMotion = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const cover = useRef<HTMLDivElement>(null);
  const placed = useRef(false);
  // A string, so a new array with the same names doesn't re-run the effect
  const layoutKey = names.join("\n");

  useLayoutEffect(() => {
    const wrap = box.current;
    const top = cover.current;
    if (!wrap || !top) return;

    // The black copy on top is cut down to the selected cell, so its text
    // turns white exactly at the edge while the cut-out slides
    const place = () => {
      const button = wrap.querySelectorAll("button")[selected];
      if (!button) return;
      // The first placement must not slide in from nowhere
      const animate = placed.current && !reduceMotion;
      top.style.transition = animate ? `clip-path 450ms ${GLIDE}` : "none";
      const right = wrap.offsetWidth - button.offsetLeft - button.offsetWidth;
      const bottom = wrap.offsetHeight - button.offsetTop - button.offsetHeight;
      top.style.clipPath = `inset(${button.offsetTop}px ${right}px ${bottom}px ${button.offsetLeft}px)`;
      placed.current = true;
    };

    place();
    // Wrapping changes with the width and once the font has loaded
    const resize = new ResizeObserver(place);
    resize.observe(wrap);
    void document.fonts?.ready.then(place);
    return () => resize.disconnect();
  }, [selected, layoutKey, reduceMotion]);

  return (
    <div ref={box} className="relative mt-4">
      <div className="flex flex-wrap gap-2">
        {names.map((name, i) => (
          <button
            key={name}
            onClick={() => onPick(i)}
            aria-pressed={i === selected}
            className={`${CELL} cursor-pointer transition-colors ${
              i <= selected
                ? `border-sumi text-sumi hover:text-jump ${i < selected ? TONE : ""}`
                : "border-tone text-ash hover:border-sumi hover:text-jump"
            }`}
          >
            {/* Same padding on both layers, so the black copy stays on top of its cell */}
            <span className={`px-1 py-px ${i < selected ? "bg-paper" : ""}`}>
              {name}
            </span>
          </button>
        ))}
      </div>
      <div
        ref={cover}
        aria-hidden="true"
        className="absolute inset-0 flex flex-wrap gap-2 pointer-events-none"
        style={{ clipPath: "inset(0 100% 100% 0)" }}
      >
        {names.map((name) => (
          <span
            key={name}
            className={`${CELL} border-sumi bg-sumi text-paper shadow-[inset_0_-3px_0_var(--color-jump)]`}
          >
            <span className="px-1 py-px">{name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

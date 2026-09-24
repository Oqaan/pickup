type Props = {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  onClear: () => void;
  ref?: React.Ref<HTMLInputElement>;
};

export default function SearchBar({
  value,
  onChange,
  onFocus,
  onClear,
  ref,
}: Props) {
  return (
    <label className="group flex items-center gap-3 h-12 px-4 border border-tone focus-within:border-sumi cursor-text transition">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="square"
        aria-hidden="true"
        className="shrink-0 text-ash group-focus-within:text-sumi transition"
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M15.5 15.5L21 21" />
      </svg>
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onChange("");
            e.currentTarget.blur();
          }
        }}
        placeholder="Search a series"
        aria-label="Search a series"
        enterKeyHint="search"
        className="flex-1 min-w-0 font-body text-base bg-transparent text-sumi placeholder:text-ash focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="shrink-0 p-1 -m-1 text-ash hover:text-jump cursor-pointer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="square"
            aria-hidden="true"
          >
            <path d="M6 6L18 18M18 6L6 18" />
          </svg>
        </button>
      )}
    </label>
  );
}

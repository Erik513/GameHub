/**
 * The logo of GameHub: four tiles (the games of the library), one of them with the play sign. It is a
 * picture next to the name, so it is hidden from screen readers; the name carries the meaning.
 */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`brand-mark ${className}`.trim()}
      focusable="false"
      viewBox="0 0 100 100"
    >
      <rect fill="#5873d6" height="42" rx="11" width="42" x="4" y="4" />
      <rect fill="#86a1ff" height="42" rx="11" width="42" x="54" y="4" />
      <rect fill="#86a1ff" height="42" rx="11" width="42" x="4" y="54" />
      <rect fill="#5873d6" height="42" rx="11" width="42" x="54" y="54" />
      <path d="M68 17l16 9-16 9z" fill="#15172a" />
    </svg>
  );
}

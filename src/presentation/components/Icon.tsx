const paths = {
  arrowLeft: "M19 12H5m6-6-6 6 6 6",
  close: "M6 6l12 12M18 6 6 18",
  chevronRight: "m9 5 7 7-7 7",
  crown: "M4 18h16M5 17 3 8l5 4 4-7 4 7 5-4-2 9",
  sliders: "M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4",
  check: "m5 12.5 4.5 4.5L19 7",
  cards: "M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM9 9h6M9 13h4",
  reset: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5",
  shuffle: "M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5",
  grip: "M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01",
  book: "M12 6.5C10.5 5.4 8.3 5 5 5v12.5c3.3 0 5.5.4 7 1.5 1.5-1.1 3.7-1.5 7-1.5V5c-3.3 0-5.5.4-7 1.5ZM12 6.5V19",
  download: "M12 4v11m-5-5 5 5 5-5M5 20h14",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  hand: "M8 13v-7.5a1.5 1.5 0 0 1 3 0v6.5M11 5.5v-2a1.5 1.5 0 0 1 3 0v8.5M14 5.5a1.5 1.5 0 0 1 3 0v6.5M17 7.5a1.5 1.5 0 0 1 3 0v8.5a6 6 0 0 1-6 6h-2h.208a6 6 0 0 1-5.012-2.7a69.74 69.74 0 0 1-.196-.3c-.312-.479-1.407-2.388-3.286-5.728a1.5 1.5 0 0 1 .536-2.022a1.867 1.867 0 0 1 2.28.28l1.47 1.47",
  moon: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z",
  pencil: "m4 20 1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1ZM14 7l3 3",
  plus: "M12 5v14M5 12h14",
  sparkle:
    "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3",
  users:
    "M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 19a5.5 5.5 0 0 1 11 0M14 14.3A5 5 0 0 1 21.5 19",
  upload: "M12 16V5m-5 5 5-5 5 5M5 20h14",
} as const;

interface IconProps {
  name: keyof typeof paths;
}

/** A small outline icon that takes the color of the surrounding text; it is purely decorative. */
export function Icon({ name }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      focusable="false"
      height="18"
      viewBox="0 0 24 24"
      width="18"
    >
      <path
        d={paths[name]}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

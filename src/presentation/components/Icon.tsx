const paths = {
  arrowLeft: "M19 12H5m6-6-6 6 6 6",
  cards: "M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM9 9h6M9 13h4",
  download: "M12 4v11m-5-5 5 5 5-5M5 20h14",
  pencil: "m4 20 1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1ZM14 7l3 3",
  sparkle:
    "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z",
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

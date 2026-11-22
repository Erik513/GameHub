import { lineGlyphs, wolfHeadPath } from "./glyphs";
import { symbolOf, type SymbolId } from "./catalog";

interface WerewolfSymbolProps {
  readonly id: SymbolId;
  /** The name for screen readers; without it the symbol is decoration next to a text. */
  readonly label?: string;
  /** Width and height in pixels. */
  readonly size?: number;
  /** An ability of a role: the drawing stands in a circle, so it never looks like the role itself. */
  readonly ring?: boolean;
}

/**
 * A symbol of Werewolf. It is drawn in the color of the text around it, so a state can tint it. Outline symbols and
 * the filled wolf head have the same box, so they stand side by side.
 */
export function WerewolfSymbol({ id, label, ring = false, size = 24 }: WerewolfSymbolProps) {
  const { glyph } = symbolOf(id);
  const accessibility = label
    ? ({ "aria-label": label, role: "img" } as const)
    : ({ "aria-hidden": true } as const);
  if (glyph === "wolfHead") {
    return (
      <svg
        className="ww-symbol"
        data-symbol={id}
        focusable="false"
        height={size}
        viewBox="0 0 512 512"
        width={size}
        {...accessibility}
      >
        {ring && (
          <circle cx="256" cy="256" fill="none" r="242" stroke="currentColor" strokeWidth="26" />
        )}
        <g transform={ring ? "translate(107.5 107.5) scale(.707)" : undefined}>
          <path d={wolfHeadPath} fill="currentColor" />
        </g>
      </svg>
    );
  }
  return (
    <svg
      className="ww-symbol"
      data-symbol={id}
      fill="none"
      focusable="false"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={size}
      {...(ring ? { "data-ring": true } : {})}
      {...accessibility}
    >
      {ring && <circle cx="12" cy="12" r="10.6" strokeWidth={1.6} />}
      <g transform={ring ? "translate(5.2 5.2) scale(.567)" : undefined}>
        {lineGlyphs[glyph].map((d) => (
          <path d={d} key={d} />
        ))}
      </g>
    </svg>
  );
}

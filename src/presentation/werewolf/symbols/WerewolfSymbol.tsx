import { lineGlyphs, wolfHeadPath } from "./glyphs";
import { symbolOf, type SymbolId } from "./catalog";

interface WerewolfSymbolProps {
  readonly id: SymbolId;
  /** The name for screen readers; without it the symbol is decoration next to a text. */
  readonly label?: string;
  /** Width and height in pixels. */
  readonly size?: number;
}

/**
 * A symbol of Werewolf. It is drawn in the color of the text around it, so a state can tint it. Outline symbols and
 * the filled wolf head have the same box, so they stand side by side.
 */
export function WerewolfSymbol({ id, label, size = 24 }: WerewolfSymbolProps) {
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
        <path d={wolfHeadPath} fill="currentColor" />
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
      {...accessibility}
    >
      {lineGlyphs[glyph].map((d) => (
        <path d={d} key={d} />
      ))}
    </svg>
  );
}

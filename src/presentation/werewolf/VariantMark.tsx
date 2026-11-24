import { useTranslation } from "react-i18next";
import type { RoleVariantId } from "../../business/games/werewolf/roleVariant";
import { lineGlyphs } from "./symbols/glyphs";
import { variantGlyphs } from "./symbols/variantGlyphs";

interface VariantMarkProps {
  readonly variant: RoleVariantId;
  /** Width and height of the whole mark in pixels. */
  readonly size?: number;
  /** Next to a text that says the same (the legend, the card): the mark is decoration. */
  readonly decorative?: boolean;
}

/**
 * The way a role is played in this game, as a small sign next to the role. The dashed frame says it is an option of the
 * role, not a state of the person.
 */
export function VariantMark({ variant, size = 18, decorative = false }: VariantMarkProps) {
  const { t } = useTranslation();
  const label = t(`werewolfNarrator.variant.${variant}`);
  return (
    <span
      className="ww-variant"
      data-variant={variant}
      style={{ height: size, width: size }}
      {...(decorative ? {} : { "aria-label": label, role: "img", title: label })}
    >
      <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height={size - 6}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.2}
        viewBox="0 0 24 24"
        width={size - 6}
      >
        {lineGlyphs[variantGlyphs[variant]].map((d) => (
          <path d={d} key={d} />
        ))}
      </svg>
    </span>
  );
}

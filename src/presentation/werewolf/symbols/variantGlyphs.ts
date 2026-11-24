import type { RoleVariantId } from "../../../business/games/werewolf/roleVariant";
import type { LineGlyph } from "./glyphs";

/** The drawing of every variant of a role (one of the outline drawings of the symbol set). */
export const variantGlyphs: Record<RoleVariantId, LineGlyph> = {
  allowed: "thumbUp",
  anyAttack: "skull",
  anyDeath: "grave2",
  doubleVote: "number2",
  forbidden: "ban",
  hammer: "gavel",
  optional: "target",
  required: "targetArrow",
  voteOnly: "ballot",
  wolfOnly: "paw",
};

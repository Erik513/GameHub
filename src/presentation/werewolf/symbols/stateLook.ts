import type { CSSProperties } from "react";
import type { CardEffect } from "../../../business/games/werewolf/narratorCard";
import { stateIds } from "../../../business/games/werewolf/roles/stateIds";
import type { SymbolId } from "./catalog";

/** The colors of the slots (each one a token --slot-* in tokens.css). */
type SlotColor =
  | "lovers"
  | "amulet"
  | "attacked"
  | "poisoned"
  | "protected"
  | "guest"
  | "saved"
  | "drunk"
  | "silenced"
  | "inspected"
  | "investigated"
  | "healed"
  | "spellHealed"
  | "hammered"
  | "twoVotes"
  | "spellKilled"
  | "wounded"
  | "shot"
  | "won";

/**
 * How every state looks as a slot: its color, and a dark sign on a light color. It is a record over all states, so the
 * compiler reports a state without a look; the drawing is the symbol of the same name in the catalog.
 */
export const stateLook: Readonly<
  Record<CardEffect, { readonly color: SlotColor; readonly darkInk?: true }>
> = {
  lovers: { color: "lovers" },
  amulet: { color: "amulet" },
  attacked: { color: "attacked" },
  protected: { color: "protected" },
  // A protection that saved the person from the attack of the wolves: dark green, like a saved row.
  protectedSaved: { color: "saved" },
  guest: { color: "guest" },
  guestSaved: { color: "saved" },
  inspected: { color: "inspected" },
  investigated: { color: "investigated" },
  healed: { color: "healed" },
  spellHealed: { color: "spellHealed" },
  poisoned: { color: "poisoned" },
  // Good or bad, depending on the point of view: yellow with a dark sign.
  hammered: { color: "hammered", darkInk: true },
  spellKilled: { color: "spellKilled" },
  silenced: { color: "silenced" },
  drunk: { color: "drunk" },
  twoVotes: { color: "twoVotes", darkInk: true },
  // Dark red like the row of the wounded tough guy.
  wounded: { color: "wounded" },
};

/** Every state is drawn with the symbol of the same name (the compiler checks that the catalog has it). */
export const stateSymbols: readonly SymbolId[] = stateIds;

/**
 * The causes of death that are no state (the vote of the village, the shot of the hunter) get a colored slot, too, in
 * this order: the vote yellow like the hammer, the shot brown.
 */
export const causeLook = {
  vote: { color: "hammered", darkInk: true },
  hunter: { color: "shot" },
} as const satisfies Record<string, { readonly color: SlotColor; readonly darkInk?: true }>;

/** A cause of death without a state that has a colored slot. */
export type CauseSlot = keyof typeof causeLook;

/** The gold slot of the tanner who has won, with his trophy. */
export const wonSlotStyle: CSSProperties = lookStyle({ color: "won" });

/** The colors of the slot of a state, for its style attribute. */
export function slotStyle(effect: CardEffect): CSSProperties {
  return lookStyle(stateLook[effect]);
}

/** The colors of the slot of a cause of death without a state, for its style attribute. */
export function causeSlotStyle(cause: CauseSlot): CSSProperties {
  return lookStyle(causeLook[cause]);
}

function lookStyle(look: { readonly color: SlotColor; readonly darkInk?: true }): CSSProperties {
  return {
    "--slot-bg": `var(--slot-${look.color})`,
    ...(look.darkInk ? { "--slot-ink": "#2b2300" } : {}),
  } as CSSProperties;
}

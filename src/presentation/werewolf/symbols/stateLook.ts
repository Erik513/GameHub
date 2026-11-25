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
  | "wounded";

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

/** The colors of the slot of a state, for its style attribute. */
export function slotStyle(effect: CardEffect): CSSProperties {
  const look = stateLook[effect];
  return {
    "--slot-bg": `var(--slot-${look.color})`,
    ...(look.darkInk ? { "--slot-ink": "#2b2300" } : {}),
  } as CSSProperties;
}

import { roleIds } from "../../../business/games/werewolf/roles/roleIds";
import type { FilledGlyph, LineGlyph } from "./glyphs";

/** The kinds of symbols: who someone is, what a role still has, the extras, and what happens to a person. */
export type SymbolGroup = "extra" | "resource" | "role" | "state";

export interface SymbolDefinition {
  readonly id: SymbolId;
  readonly group: SymbolGroup;
  /** The drawing: an outline glyph, or the wolf head. Symbols of one meaning share a drawing on purpose. */
  readonly glyph: LineGlyph | FilledGlyph;
}

const definitions = [
  // The roles, named like the roles of the logic (wolf, seer and villager are the basic roles).
  { glyph: "wolfHead", group: "role", id: "wolf" },
  { glyph: "crystalBall", group: "role", id: "seer" },
  { glyph: "crystalBallZ", group: "role", id: "apprenticeSeer" },
  { glyph: "user", group: "role", id: "villager" },
  { glyph: "witchFace", group: "role", id: "witch" },
  { glyph: "blunderbuss", group: "role", id: "hunter" },
  { glyph: "thumbUp", group: "role", id: "idiot" },
  { glyph: "userShield", group: "role", id: "bodyguard" },
  { glyph: "homeHeart", group: "role", id: "nightGuest" },
  { glyph: "cupidBow", group: "role", id: "cupid" },
  { glyph: "barbell", group: "role", id: "toughGuy" },
  { glyph: "trophy", group: "role", id: "tanner" },
  { glyph: "microphone", group: "role", id: "spellcaster" },
  { glyph: "crown", group: "role", id: "mayor" },
  { glyph: "ghost", group: "role", id: "paranormalInvestigator" },
  { glyph: "wand", group: "role", id: "magician" },
  // What a role has besides its ability; a used one is struck through.
  { glyph: "flaskPlus", group: "resource", id: "healPotion" },
  { glyph: "heartPlus", group: "resource", id: "heal" },
  { glyph: "skull", group: "resource", id: "kill" },
  { glyph: "gavel", group: "resource", id: "hammer" },
  { glyph: "number2", group: "resource", id: "doubleVote" },
  { glyph: "search", group: "resource", id: "investigation" },
  { glyph: "targetArrow", group: "resource", id: "shotDuty" },
  // The extras.
  { glyph: "diamond", group: "extra", id: "amulet" },
  { glyph: "bottle", group: "extra", id: "drunk" },
  // What happens to a person.
  { glyph: "hearts", group: "state", id: "lovers" },
  { glyph: "paw", group: "state", id: "attacked" },
  { glyph: "shield", group: "state", id: "protected" },
  { glyph: "bedFlat", group: "state", id: "guest" },
  { glyph: "shield", group: "state", id: "protectedSaved" },
  { glyph: "bedFlat", group: "state", id: "guestSaved" },
  { glyph: "gavel", group: "state", id: "hammered" },
  { glyph: "number2", group: "state", id: "twoVotes" },
  { glyph: "skull", group: "state", id: "spellKilled" },
  { glyph: "eye", group: "state", id: "inspected" },
  { glyph: "search", group: "state", id: "investigated" },
  { glyph: "flaskMinus", group: "state", id: "poisoned" },
  { glyph: "flaskPlus", group: "state", id: "healed" },
  { glyph: "heartPlus", group: "state", id: "spellHealed" },
  { glyph: "bandage", group: "state", id: "wounded" },
  { glyph: "microphoneOff", group: "state", id: "silenced" },
  { glyph: "arrowsExchange", group: "state", id: "amuletPass" },
  { glyph: "grave2", group: "state", id: "dead" },
  // The day: its own card in the narrator view and the vote that it holds.
  { glyph: "sun", group: "state", id: "day" },
  { glyph: "ballot", group: "state", id: "vote" },
] as const;

export type SymbolId = (typeof definitions)[number]["id"];

/** Every role of the game has a symbol of the same name (the compiler checks it against roles/roleIds.ts). */
export const roleSymbols: readonly SymbolId[] = roleIds;

/** All symbols in the order of the legend. */
export const symbols: readonly SymbolDefinition[] = definitions;

const byId = new Map<SymbolId, SymbolDefinition>(definitions.map((entry) => [entry.id, entry]));

export function symbolOf(id: SymbolId): SymbolDefinition {
  return byId.get(id)!;
}

export const symbolGroups: readonly SymbolGroup[] = ["role", "resource", "extra", "state"];

/** The abilities of the roles as the narrator view draws them (in a circle): the ability and the drawing it uses. */
export const abilityLegend = [
  { ability: "attack", symbol: "attacked" },
  { ability: "inspect", symbol: "inspected" },
  { ability: "investigate", symbol: "investigation" },
  { ability: "heal", symbol: "healPotion" },
  { ability: "poison", symbol: "poisoned" },
  { ability: "kill", symbol: "kill" },
  { ability: "protect", symbol: "protected" },
  { ability: "stayWith", symbol: "guest" },
  { ability: "bond", symbol: "lovers" },
  { ability: "hammer", symbol: "hammer" },
  { ability: "silence", symbol: "silenced" },
  { ability: "shot", symbol: "shotDuty" },
  { ability: "passAmulet", symbol: "amuletPass" },
  { ability: "vote", symbol: "vote" },
] as const satisfies readonly { readonly ability: string; readonly symbol: SymbolId }[];

/** Symbols that the legend lists as an ability (in a circle) and not a second time as a state. */
export const legendHidden: ReadonlySet<SymbolId> = new Set<SymbolId>(["vote", "amuletPass"]);

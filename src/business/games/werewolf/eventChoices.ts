import { validTargets, votingPlayers } from "./selectors";
import {
  transitionWerewolf,
  voteNeeded,
  voteTotal,
  type WerewolfEvent,
  type WerewolfState,
} from "./stateMachine";

/**
 * Test helper (not part of the game logic): the events the game accepts in a state, enumerated through the selectors and
 * checked against the reducer. Used by the random games and by the coverage test of the narrator guide.
 */
export function eventChoices(s: WerewolfState): WerewolfEvent[] {
  const night = s.night;
  const targets = validTargets(s);
  const choose = (
    type:
      | "attack"
      | "protect"
      | "stayWith"
      | "hammer"
      | "inspect"
      | "investigate"
      | "silence"
      | "shot"
      | "passAmulet",
  ) => targets.map((target) => ({ type, night, target }));
  switch (s.status) {
    case "roles":
      return [{ type: "roleSeen", player: s.players[s.index]!.name }];
    case "nightCall":
      return [{ type: "acknowledgeCall", night }];
    case "amuletPass":
      return choose("passAmulet");
    case "cupid":
      return targets.flatMap((a) =>
        validTargets(s, "bond", { selected: [a] }).map(
          (b) => ({ type: "bond", night, players: [a, b] }) as const,
        ),
      );
    case "lovers":
      return [{ type: "loversReady", night }];
    case "drunkReveal":
    case "drunkHunter":
      return [{ type: "drunkReady", night }];
    case "mayor":
      return [...choose("hammer"), { type: "hammer", night, target: null }];
    case "bodyguard":
      return choose("protect");
    case "nightGuest":
      return choose("stayWith");
    case "wolves":
      return night === 1 && !s.settings.attackOnFirstNight
        ? [{ type: "wolvesReady", night }]
        : // The werewolves have to attack: "nobody" is only offered when there is no possible victim.
          choose("attack").length > 0
          ? choose("attack")
          : [{ type: "attack", night, target: null }];
    case "seer":
      return choose("inspect");
    case "vision":
      return [{ type: "closeVision", night }];
    case "investigator":
      return [...choose("investigate"), { type: "investigate", night, target: null }];
    case "investigation":
      return [{ type: "closeInvestigation", night }];
    case "witch":
      return [false, true]
        .flatMap((heal) =>
          [null, ...validTargets(s, "poison", { heal })].map(
            (poison) => ({ type: "potions", night, heal, poison }) as const,
          ),
        )
        .filter((e) => transitionWerewolf(s, e) !== s);
    case "magician":
      return [false, true]
        .flatMap((heal) =>
          [
            [],
            ...validTargets(s, "kill", { heal }).flatMap((a) => [
              [a],
              ...validTargets(s, "kill", { heal, selected: [a] }).map((b) => [a, b]),
            ]),
          ].map((kill) => ({ type: "castSpells", night, heal, kill }) as const),
        )
        .filter((e) => transitionWerewolf(s, e) !== s);
    case "spellcaster":
      return targets.length ? choose("silence") : [{ type: "silence", night, target: null }];
    case "morning":
      return [{ type: "announceMorning", night }];
    case "day":
      return [
        ...targets.map((target) => ({ type: "nominate", night, nominees: [target] }) as const),
        { type: "endDay", night },
      ];
    case "vote":
      if (s.candidates.length === 1) {
        const only = s.candidates[0]!;
        return [...new Set([0, voteNeeded(s), voteTotal(s)])]
          .filter((count) => count <= voteTotal(s))
          .map((count) => ({
            type: "voteCount",
            night,
            nomination: s.nomination,
            counts: { [only]: count },
          }));
      }
      // Every voter chooses the first candidate who is not himself.
      return [
        {
          type: "vote",
          night,
          nomination: s.nomination,
          ballots: Object.fromEntries(
            votingPlayers(s)
              .filter((p) => p.choices.length > 0)
              .map((p) => [p.name, p.choices[0]!]),
          ),
        } as const,
      ];
    case "exile":
      return [{ type: "announceExile", night }];
    case "hunter":
      return [
        ...choose("shot"),
        ...(s.settings.hunterShot === "optional" || !s.alive.length
          ? [{ type: "shot", night, target: null } as const]
          : []),
      ];
    case "finished":
      return [];
  }
}

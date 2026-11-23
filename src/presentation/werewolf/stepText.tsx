import type { ReactNode } from "react";
import type { TFunction } from "i18next";
import type { GuideView } from "../../business/games/werewolf/narratorGuide";
import { describeRoleStep, type RoleStepSpec } from "../../business/games/werewolf/roleStep";
import { werewolfDrunkReveal } from "../../business/games/werewolf/stateMachine";
import { DayNotes } from "./RoleStepContent";

/*
 * What a role says in the box: the heading and the lines under the choice, chosen by the description of the step
 * (`describeRoleStep`). The box itself is one building block for every role.
 */

/** The text of a step in which the narrator only reads something out (the lovers, the wolves who look at each other). */
export function actInfo(view: GuideView, t: TFunction): string | null {
  const { state } = view;
  switch (state.status) {
    case "lovers":
      return t("werewolfNarrator.guide.lovers");
    case "wolves":
      // The setting "attack from night 2": in the first night the wolves only get to know each other (the script);
      // that they do not attack is a hint below the script (see `stepExtras`).
      return describeRoleStep(state).statement === "noAttack"
        ? t("werewolfNarrator.guide.wolvesLook")
        : null;
    default:
      return null;
  }
}

/**
 * What a role found out, for the summary box: the verdict of the seer or the investigator (green when a werewolf was
 * found, red when not), or who the drunk really is. It is a result, not a script, so it never stands in the box of the
 * script. null where the step has no result.
 */
export function factOf(view: GuideView, t: TFunction): { text: string; wolf?: boolean } | null {
  const { state } = view;
  const { result } = describeRoleStep(state);
  if (result) {
    const kind =
      result.ability === "inspect"
        ? result.found
          ? "wolf"
          : "village"
        : result.found
          ? "near"
          : "clear";
    return { text: t(`werewolfNarrator.guide.verdict.${kind}`), wolf: result.found };
  }
  if (state.status === "drunkReveal" || state.status === "drunkHunter") {
    const player = werewolfDrunkReveal(state);
    return player
      ? {
          text: t("werewolfNarrator.guide.drunk", {
            name: player.name,
            role: t(`werewolfSymbols.items.${player.role}.name`),
          }),
        }
      : null;
  }
  return null;
}

/** What the narrator reads or does during the day: nominate (three choices), vote, or end the day. */
export function dayPrompt(view: GuideView, t: TFunction): string | null {
  const { selection, state } = view;
  if (state.status === "vote")
    return t(
      state.round === 2
        ? "werewolfNarrator.guide.day.votersAgain"
        : "werewolfNarrator.guide.day.voters",
    );
  if (state.status !== "day") return null;
  if (selection.ability !== "vote") return null;
  const names = selection.picks.join(", ");
  if (selection.picks.length === 0) return t("werewolfNarrator.guide.day.nominee");
  if (selection.picks.length < 3) return t("werewolfNarrator.guide.day.more", { names });
  return t("werewolfNarrator.guide.day.chosen", { names });
}

/** The heading of the box: the ask of the step, what the narrator reads out, or what to do next. */
export function stepTitle(view: GuideView, step: RoleStepSpec, t: TFunction) {
  const { card, selection, state } = view;
  if (!card) return null;
  if (card.cover) return t("werewolfNarrator.guide.coverTitle");
  // The witch is asked two questions, always both: the script of the narrator. Hints (the victim, a used potion) stand
  // below the choice with a yellow border.
  if (view.question !== null && selection.ability === null)
    return t(
      view.question === "heal"
        ? "werewolfNarrator.guide.witch.healAsk"
        : "werewolfNarrator.guide.witch.poisonAsk",
    );
  // What the narrator does when a result is shown: the result itself stands in the summary box.
  if (step.result) return t("werewolfNarrator.guide.resultScript");
  if (state.status === "drunkReveal" || state.status === "drunkHunter")
    return t("werewolfNarrator.guide.drunkScript");
  const info = actInfo(view, t) ?? dayPrompt(view, t);
  if (info !== null) return info;
  if (selection.ability)
    return t(
      `werewolfNarrator.guide.ask.${selection.ability === "inspect" && card.role === "apprenticeSeer" ? "inspectApprentice" : selection.ability}`,
    );
  return askText(view, t) ?? t("werewolfNarrator.guide.confirmDone");
}

/**
 * What the narrator reads out to ask for the decision of the role, before an ability is opened: the instruction of the
 * role ("the bodyguard chooses a person to protect"). null where the role has no decision.
 */
export function askText(view: GuideView, t: TFunction): string | null {
  const { card, selection } = view;
  if (!card) return null;
  if (card.role === "magician") return t("werewolfNarrator.guide.choose.magician");
  const id =
    selection.ability ?? card.abilities.find((ability) => ability.id !== "heal")?.id ?? null;
  if (id === null) return null;
  return t(
    `werewolfNarrator.guide.ask.${id === "inspect" && card.role === "apprenticeSeer" ? "inspectApprentice" : id}`,
  );
}

/** One box of the script of a role: the tasks of the narrator, the button right of it and where the script stands. */
export interface ScriptBox {
  readonly id:
    "asleep" | "wake" | "confirm" | "decide" | "discuss" | "heal" | "poison" | "show" | "touch";
  readonly items: readonly ReactNode[];
  /** The button right of the box: take the decision back, or confirm that the task is done; none for the last box. */
  readonly button: "check" | "undo" | null;
  readonly enabled: boolean;
  /** The symbol of the ability that the box is about, shown before the text. */
  readonly symbol?: string;
  /** Several symbols before the text (the magician's first question: the healing and the death spell). */
  readonly symbols?: readonly string[];
  /** Player names in the texts of the box: they are shown in bold. */
  readonly names?: readonly string[];
  /** A part of the text that is shown in red ("no victim"). */
  readonly red?: string;
  readonly state: "active" | "done" | "pending";
}

/**
 * The script of the narrator for the step of a role, from the first task to the falling asleep: the boxes from top to
 * bottom, all visible from the start. Every box except the last one has a button right of it (undo, or a check that says
 * the task is done). null for the day, which is no role.
 */
export function scriptOf(view: GuideView, step: RoleStepSpec, t: TFunction): ScriptBox[] | null {
  const boxes = roleBoxes(view, step, t);
  const { card } = view;
  if (!boxes || !card) return boxes;
  // The day has no wake box either: nobody is woken up.
  if (card.role === "day") return boxes;
  const intro = view.phase === "intro";
  // The box "the role wakes up" stays the first box of the script: its check shows the role, afterwards it is done.
  const wake: ScriptBox = {
    button: "check",
    enabled: intro,
    id: "wake",
    items: [t(`werewolfNarrator.guide.wake.${card.role}`)],
    state: intro ? "active" : "done",
  };
  const symbolOf = (id: ScriptBox["id"]): string | undefined => {
    const wanted =
      id === "heal"
        ? "heal"
        : id === "poison"
          ? "poison"
          : id === "show" || id === "touch"
            ? "bond"
            : view.selection.ability;
    return (
      card.abilities.find((ability) => ability.id === wanted)?.symbol ??
      card.abilities.find((ability) => ability.id !== "heal")?.symbol ??
      card.abilities[0]?.symbol
    );
  };
  // The hunter acts in public: nobody is woken up, so there is no box for that.
  return [
    ...(card.role === "hunter" ? [] : [wake]),
    ...boxes.map((box) => {
      // The wolves who only look at each other (no attack in the first night) have no ability to show.
      const showsVictim =
        box.id === "show" && (view.state.status === "witch" || view.state.status === "magician");
      const symbol =
        box.id === "asleep" || step.statement === "noAttack"
          ? undefined
          : showsVictim
            ? // Showing the victim is about the attack of the wolves: their symbol, not an ability of the role.
              "attacked"
            : symbolOf(box.id);
      // The first question of the magician is about both spells: the healing and the death spell.
      const both =
        box.id === "heal" && view.state.status === "magician"
          ? card.abilities.map((ability) => ability.symbol)
          : undefined;
      return {
        ...box,
        ...(symbol ? { symbol } : {}),
        ...(both ? { symbols: both } : {}),
        ...(intro ? { enabled: false, state: "pending" as const } : {}),
      };
    }),
  ];
}

function roleBoxes(view: GuideView, step: RoleStepSpec, t: TFunction): ScriptBox[] | null {
  const { card, selection, state } = view;
  if (!card) return null;
  // The day: the village discusses (the check opens the options above), somebody is nominated or not, the day ends.
  if (card.role === "day") {
    if (state.status !== "day" || view.phase !== "act") return null;
    const progress = view.progress;
    return [
      {
        // One box: the village discusses, then somebody is nominated or not. The options above are free at once; its
        // reset button takes "no vote" back.
        button: "undo",
        enabled: progress >= 1,
        id: "discuss",
        items: [t("werewolfNarrator.guide.day.nominateAsk")],
        // The vote: the symbol of the ability.
        symbol: "vote",
        state: progress >= 1 ? "done" : "active",
      },
      {
        button: null,
        enabled: false,
        id: "asleep",
        items: [t("werewolfNarrator.guide.sleep.day")],
        // Once "no vote" is chosen the day can end: this box is what comes next (blue frame).
        state: progress >= 1 ? "active" : "pending",
      },
    ];
  }
  const outro = view.phase === "outro";
  const asleep: ScriptBox = {
    button: null,
    enabled: false,
    id: "asleep",
    items: [t(`werewolfNarrator.guide.sleep.${card.role}`)],
    state: outro ? "active" : "pending",
  };

  // The witch and the magician: show the victim, two questions, then falling asleep.
  if (view.question !== null && !card.cover) {
    const victim = state.wolfTarget;
    // The first box is done once the narrator has shown the victim (its check) or the first question is answered.
    const shown = outro || view.progress >= 1 || view.question === "poison";
    return [
      {
        button: shown ? "undo" : "check",
        enabled: true,
        id: "show",
        ...(victim
          ? { names: [victim.name] }
          : { red: t("werewolfNarrator.guide.witch.noVictimWord") }),
        items: [
          victim
            ? t("werewolfNarrator.guide.witch.showVictim", { name: victim.name })
            : t("werewolfNarrator.guide.witch.showNoVictim"),
        ],
        state: shown ? "done" : "active",
      },
      {
        button: "undo",
        enabled: outro || view.question === "poison",
        id: "heal",
        items: [
          t(
            state.status === "magician"
              ? "werewolfNarrator.guide.magician.firstAsk"
              : "werewolfNarrator.guide.witch.healAsk",
          ),
        ],
        state: outro || view.question === "poison" ? "done" : shown ? "active" : "pending",
      },
      {
        button: "undo",
        enabled: outro || selection.ability === "poison",
        id: "poison",
        items: [
          t(
            state.status === "magician"
              ? "werewolfNarrator.guide.magician.secondAsk"
              : "werewolfNarrator.guide.witch.poisonAsk",
          ),
        ],
        state: outro ? "done" : view.question === "poison" ? "active" : "pending",
      },
      asleep,
    ];
  }

  // Cupid: point at two people, falling asleep, touching the two (the names stand once they are chosen).
  if (state.status === "cupid") {
    const decided = selection.picks.length === 2;
    const progress = outro ? 3 : view.progress;
    return [
      {
        // A decision: undo from the start (the check mark of the list of people confirms it).
        button: "undo",
        enabled: progress >= 1 || decided,
        id: "show",
        items: [t("werewolfNarrator.guide.cupid.show")],
        state: progress >= 1 ? "done" : "active",
      },
      {
        button: "check",
        enabled: progress === 1,
        id: "asleep",
        items: [t("werewolfNarrator.guide.sleep.cupid")],
        state: progress >= 2 ? "done" : progress === 1 ? "active" : "pending",
      },
      {
        button: "check",
        enabled: progress === 2,
        id: "touch",
        ...(decided ? { names: selection.picks } : {}),
        items: [
          decided
            ? t("werewolfNarrator.guide.cupid.touch", {
                first: selection.picks[0],
                second: selection.picks[1],
              })
            : t("werewolfNarrator.guide.cupid.touchAny"),
        ],
        state: progress >= 3 ? "done" : progress === 2 ? "active" : "pending",
      },
    ];
  }

  // A role that decides: its script, then falling asleep.
  if (step.kind === "choose") {
    const text = outro ? (askText(view, t) ?? stepTitle(view, step, t)) : stepTitle(view, step, t);
    return [
      {
        // A decision: the undo button is there from the start (switched off until something is chosen). The choice is
        // confirmed with the check mark of the list of people or with "skip".
        button: "undo",
        enabled: outro || view.canUndo,
        id: "decide",
        items: [text],
        state: outro ? "done" : "active",
      },
      asleep,
    ];
  }

  // A step in which the narrator only reads something out or shows something: the check says it is done.
  return [
    {
      button: outro ? "undo" : "check",
      enabled: outro || view.canContinue,
      id: "confirm",
      items: [stepTitle(view, step, t)],
      state: outro ? "done" : "active",
    },
    asleep,
  ];
}

/** The lines under the choice: the victim of the wolves, the hint to skip, a restriction, the notes of the day. */
export function stepExtras(view: GuideView, step: RoleStepSpec, t: TFunction) {
  const { card, selection, state } = view;
  if (!card) return [];
  return [
    !card.cover && step.showsVictim && (
      <span className="ww-guide__victim" key="victim">
        {state.wolfTarget
          ? t("werewolfNarrator.guide.victim", { name: state.wolfTarget.name })
          : t("werewolfNarrator.guide.noVictim")}
      </span>
    ),
    // The holder of the amulet was attacked, or may keep it: what the narrator has to know, below the script.
    state.status === "amuletPass" && (
      <span className="ww-guide__victim" key="amulet">
        {t(
          state.amulet.mustPass
            ? "werewolfNarrator.guide.amuletMust"
            : "werewolfNarrator.guide.amuletMay",
          { name: state.amulet.holder },
        )}
      </span>
    ),
    // The option of the hunter: whether he has to shoot or may leave it out (the setting of the game).
    (state.status === "hunter" || state.status === "drunkHunter") && (
      <span className="ww-guide__victim" key="hunter">
        {t(
          step.skippable ? "werewolfNarrator.guide.hunterMay" : "werewolfNarrator.guide.hunterMust",
        )}
      </span>
    ),
    step.statement === "noAttack" && (
      <span className="ww-guide__victim" key="noAttack">
        {t("werewolfNarrator.guide.wolvesNoAttack")}
      </span>
    ),
    // A potion of the witch that is used up: the reason why the button cannot be used.
    ...(!card.cover && state.status === "witch"
      ? card.abilities
          .filter((ability) => ability.unavailable === "used")
          .map((ability) => (
            <span className="ww-guide__victim" key={"used-" + ability.id}>
              {t(
                ability.id === "heal"
                  ? "werewolfNarrator.guide.witch.healUsed"
                  : "werewolfNarrator.guide.witch.poisonUsed",
              )}
            </span>
          ))
      : []),
    !card.cover && selection.heal && state.wolfTarget && (
      <span className="ww-guide__victim" key="heal">
        {t("werewolfNarrator.guide.healChosen", { name: state.wolfTarget.name })}
      </span>
    ),
    view.notes.restricted && (
      <small key="restricted">
        {t("werewolfNarrator.guide.restricted", { name: view.notes.restricted })}
      </small>
    ),
    // The notes of the day stand while nobody is chosen; they do not disturb the choice of people.
    (state.status === "day" || state.status === "vote") && selection.ability === null && (
      <DayNotes key="notes" view={view} />
    ),
  ].filter(Boolean);
}

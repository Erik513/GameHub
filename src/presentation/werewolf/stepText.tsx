import type { ReactNode } from "react";
import type { TFunction } from "i18next";
import type { GuideView } from "../../business/games/werewolf/narratorGuide";
import { describeRoleStep, type RoleStepSpec } from "../../business/games/werewolf/roleStep";
import { werewolfDrunkReveal } from "../../business/games/werewolf/stateMachine";
import { DayNotes, ResultText } from "./RoleStepContent";

/*
 * What a role says in the box: the heading and the lines under the choice, chosen by the description of the step
 * (`describeRoleStep`). The box itself is one building block for every role.
 */

/** The result of a step in which the narrator reads something out (what the seer sees, who is in love). */
export function actInfo(view: GuideView, t: TFunction): string | null {
  const { state } = view;
  const { result } = describeRoleStep(state);
  if (result)
    return t(
      result.ability === "inspect"
        ? `werewolfNarrator.guide.vision.${result.found ? "wolf" : "village"}`
        : `werewolfNarrator.guide.investigation.${result.found ? "yes" : "no"}`,
      { name: result.name },
    );
  switch (state.status) {
    case "lovers":
      return t("werewolfNarrator.guide.lovers.names", {
        first: state.lovers[0],
        second: state.lovers[1],
      });
    case "drunkReveal":
    case "drunkHunter": {
      const player = werewolfDrunkReveal(state);
      return player
        ? t("werewolfNarrator.guide.drunk", {
            name: player.name,
            role: t(`werewolfSymbols.items.${player.role}.name`),
          })
        : null;
    }
    case "wolves":
      // The setting "attack from night 2": in the first night the wolves only get to know each other.
      return describeRoleStep(state).statement === "noAttack"
        ? t("werewolfNarrator.guide.wolvesNoAttack")
        : null;
    case "amuletPass":
      return t(
        state.amulet.mustPass
          ? "werewolfNarrator.guide.amuletMust"
          : "werewolfNarrator.guide.amuletMay",
        { name: state.amulet.holder },
      );
    default:
      return null;
  }
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
  if (selection.ability !== "vote") return t("werewolfNarrator.guide.day.idle");
  const names = selection.picks.join(", ");
  if (selection.picks.length === 0) return t("werewolfNarrator.guide.day.nominee");
  if (selection.picks.length < 3) return t("werewolfNarrator.guide.day.more", { names });
  return t("werewolfNarrator.guide.day.chosen", { names });
}

/** The heading of the box: the ask of the step, what the narrator reads out, or what to do next. */
export function stepTitle(view: GuideView, step: RoleStepSpec, t: TFunction) {
  const { card, selection } = view;
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
  const info = actInfo(view, t) ?? dayPrompt(view, t);
  if (info !== null) return <ResultText step={step} text={info} />;
  if (selection.ability)
    return t(
      `werewolfNarrator.guide.ask.${selection.ability === "inspect" && card.role === "apprenticeSeer" ? "inspectApprentice" : selection.ability}`,
    );
  return card.abilities.length > 0
    ? t("werewolfNarrator.guide.pickAbility")
    : t("werewolfNarrator.guide.confirmDone");
}

/**
 * The script of the narrator for roles with more than one task in their box: the tasks as a list. null where the box
 * holds a single text (see `stepTitle`).
 */
export function stepItems(view: GuideView, t: TFunction): string[] | null {
  const { state } = view;
  if (state.status === "lovers")
    return [
      t("werewolfNarrator.guide.lovers.open"),
      t("werewolfNarrator.guide.lovers.names", {
        first: state.lovers[0],
        second: state.lovers[1],
      }),
    ];
  return null;
}

/** One box of the script of a role: the tasks of the narrator, the button right of it and where the script stands. */
export interface ScriptBox {
  readonly id: "asleep" | "wake" | "confirm" | "decide" | "heal" | "poison" | "show" | "touch";
  readonly items: readonly ReactNode[];
  /** The text under the last box ("press Next"). */
  readonly hint?: string;
  /** The button right of the box: take the decision back, or confirm that the task is done; none for the last box. */
  readonly button: "check" | "undo" | null;
  readonly enabled: boolean;
  /** The symbol of the ability that the box is about, shown before the text. */
  readonly symbol?: string;
  /** Player names in the texts of the box: they are shown in bold. */
  readonly names?: readonly string[];
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
  return [
    wake,
    ...boxes.map((box) => {
      const symbol = box.id === "asleep" ? undefined : symbolOf(box.id);
      return {
        ...box,
        ...(symbol ? { symbol } : {}),
        ...(intro ? { enabled: false, state: "pending" as const } : {}),
      };
    }),
  ];
}

function roleBoxes(view: GuideView, step: RoleStepSpec, t: TFunction): ScriptBox[] | null {
  const { card, selection, state } = view;
  if (!card || card.role === "day") return null;
  const outro = view.phase === "outro";
  const asleep: ScriptBox = {
    button: null,
    enabled: false,
    ...(outro ? { hint: t("werewolfNarrator.guide.tap.outroSub") } : {}),
    id: "asleep",
    items: [t(`werewolfNarrator.guide.sleep.${card.role}`)],
    state: outro ? "active" : "pending",
  };

  // The witch: two questions, then falling asleep.
  if (view.question !== null && !card.cover) {
    const victim = state.wolfTarget;
    return [
      {
        button: "undo",
        enabled: outro || view.question === "poison",
        id: "heal",
        ...(victim ? { names: [victim.name] } : {}),
        items: [
          victim
            ? t("werewolfNarrator.guide.witch.showVictim", { name: victim.name })
            : t("werewolfNarrator.guide.witch.showNoVictim"),
          t("werewolfNarrator.guide.witch.healAsk"),
        ],
        state: outro || view.question === "poison" ? "done" : "active",
      },
      {
        button: "undo",
        enabled: outro || selection.ability === "poison",
        id: "poison",
        items: [t("werewolfNarrator.guide.witch.poisonAsk")],
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
        // The decision is confirmed here; after that the box can take it back.
        button: progress >= 1 ? "undo" : "check",
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
    const askAbility =
      selection.ability ?? card.abilities.find((ability) => ability.id !== "heal")?.id ?? null;
    const text =
      outro && askAbility
        ? t(
            `werewolfNarrator.guide.ask.${askAbility === "inspect" && card.role === "apprenticeSeer" ? "inspectApprentice" : askAbility}`,
          )
        : stepTitle(view, step, t);
    return [
      {
        button: outro ? "undo" : "check",
        enabled: outro || view.canContinue,
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
      ...(state.status === "lovers" ? { names: state.lovers } : {}),
      items: stepItems(view, t) ?? [stepTitle(view, step, t)],
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

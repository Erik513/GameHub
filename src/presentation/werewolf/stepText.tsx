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
      return t("werewolfNarrator.guide.lovers", {
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

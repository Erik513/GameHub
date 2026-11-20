import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FixedDraft } from "../../business/games/werewolf/fixedConfiguration";
import {
  wakeOrder,
  wakeOrderVariable,
  type WakeStep,
} from "../../business/games/werewolf/wakeOrder";
import type { VariableDraft } from "../../business/games/werewolf/variableConfiguration";
import { Button, Dialog, Icon } from "../components";

/**
 * The button that shows in which order the roles wake up every night, and its window. The roles that
 * are not in the game are dimmed, the others are numbered in the order of the night.
 */
export function WakeOrderButton({
  draft,
  mode = "fixed",
  variableDraft,
}: {
  /** The fixed draft. */
  readonly draft: FixedDraft;
  /** Which draft is shown: the fixed one, or the variable one (roles that may be in the game are shown as possible steps). */
  readonly mode?: "fixed" | "variable";
  readonly variableDraft?: VariableDraft;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const variable = mode === "variable" && variableDraft !== undefined ? variableDraft : undefined;
  const steps = variable ? wakeOrderVariable(variable) : wakeOrder(draft);
  const attackOnFirstNight = variable
    ? variable.rules.attackOnFirstNight
    : draft.settings.attackOnFirstNight;
  const apprentice = variable
    ? (variable.states.apprenticeSeer ?? "not") !== "not"
    : draft.roles.includes("apprenticeSeer");
  // The roles of the guard step that are (possibly) in the game.
  const guardRoles = (["bodyguard", "nightGuest"] as const).filter((role) =>
    variable ? (variable.states[role] ?? "not") !== "not" : draft.roles.includes(role),
  );
  // The steps that take part are numbered in the order of the night.
  const numbers = steps.map(
    (_, index) => steps.slice(0, index + 1).filter((step) => step.inGame).length,
  );

  // The name of a step: the guard says which of its two roles is chosen (or both when none is).
  const nameOf = (step: WakeStep) => {
    if (step.id === "guard") {
      return (guardRoles.length > 0 ? guardRoles : (["bodyguard", "nightGuest"] as const))
        .map((role) => t(`werewolfConfig.roles.${role}`))
        .join(" / ");
    }
    return t(`werewolfConfig.wake.steps.${step.id}`);
  };
  // A short note for a step that does not play every night or has something special.
  const noteOf = (step: WakeStep) => {
    if (step.timing) return t(`werewolfConfig.wake.timing.${step.timing}`);
    if (step.id === "wolves" && !attackOnFirstNight) {
      return t("werewolfConfig.wake.wolvesFirstNight");
    }
    if (step.id === "seer" && apprentice) {
      return t("werewolfConfig.wake.apprentice");
    }
    if (step.id === "amulet") return t("werewolfConfig.wake.amulet");
    return null;
  };

  return (
    <>
      <Button
        aria-label={t("werewolfConfig.wake.open")}
        className="kit-lineup__settings"
        onClick={() => setOpen(true)}
        title={t("werewolfConfig.wake.open")}
        variant="secondary"
      >
        <Icon name="moon" />
      </Button>
      <Dialog
        closeLabel={t("werewolfConfig.infoClose")}
        description={t(variable ? "werewolfConfig.wake.hintVariable" : "werewolfConfig.wake.hint")}
        onClose={() => setOpen(false)}
        open={open}
        title={t("werewolfConfig.wake.title")}
      >
        <ol className="ww-wake">
          {steps.map((step, index) => {
            const note = noteOf(step);
            return (
              <li
                className="ww-wake__step"
                data-in-game={step.inGame}
                data-presence={step.presence}
                key={step.id}
              >
                <span aria-hidden="true" className="ww-wake__number">
                  {step.inGame ? numbers[index] : "–"}
                </span>
                <span className="ww-wake__text">
                  <strong>{nameOf(step)}</strong>
                  {step.presence === "may" && <small>{t("werewolfConfig.wake.maybe")}</small>}
                  {step.inGame ? (
                    note && <small>{note}</small>
                  ) : (
                    <small>{t("werewolfConfig.wake.notInGame")}</small>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </Dialog>
    </>
  );
}

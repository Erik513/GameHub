import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { describeWinners, type GuideView } from "../../business/games/werewolf/narratorGuide";
import { describeRoleStep } from "../../business/games/werewolf/roleStep";
import {
  currentWerewolfRole,
  werewolfAnnouncement,
  type WerewolfState,
} from "../../business/games/werewolf/stateMachine";
import { Icon } from "../components";
import { DealCard } from "./DealCard";
import { variantOfRole } from "./roleAbilities";
import { stepExtras, stepTitle } from "./stepText";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";

interface GuideBoxProps {
  readonly view: GuideView;
  readonly onChoose: (name: string) => void;
  readonly onCloseAbility: () => void;
  readonly onContinue: () => void;
  readonly onBallot: (voter: string, candidate: string) => void;
  readonly onNobody: () => void;
  readonly onReopen: () => void;
  readonly onUndo: () => void;
  readonly onUnchoose: (name: string) => void;
}

/**
 * The lower box of the narrator view: it says what the narrator reads aloud or does now. A tap on the box goes on
 * where nothing has to be decided; where a person has to be chosen, the people are listed here.
 */
export function GuideBox({
  view,
  onChoose,
  onCloseAbility,
  onContinue,
  onBallot,
  onNobody,
  onReopen,
  onUndo,
  onUnchoose,
}: GuideBoxProps) {
  const { t } = useTranslation();
  const { card, phase, selection, state } = view;

  if (phase === "ready") return <ReadyBox />;
  if (phase === "plain") return <PlainBox view={view} />;
  if (!card) return null;

  if (phase === "intro") {
    return (
      <button className="ww-guide ww-guide--tap" onClick={onContinue} type="button">
        <span className="ww-guide__heading">
          <strong className="ww-guide__text">
            <WerewolfSymbol id={card.role} size={32} />
            {t(`werewolfNarrator.guide.wake.${card.role}`)}
          </strong>
          <span className="ww-guide__sub">{t("werewolfNarrator.guide.tap.introSub")}</span>
        </span>
      </button>
    );
  }

  if (phase === "outro") {
    // The role is asleep again. The box only says so; going on to the next role is the job of the button "next".
    return (
      <section className="ww-guide ww-guide--sheet ww-guide--asleep">
        <header className="ww-guide__head">
          <span className="ww-guide__heading">
            <strong className="ww-guide__text">
              <WerewolfSymbol id={card.role} size={32} />
              {t(`werewolfNarrator.guide.sleep.${card.role}`)}
            </strong>
            <span className="ww-guide__sub">{t("werewolfNarrator.guide.tap.outroSub")}</span>
          </span>
        </header>
        <div className="ww-guide__body" />
        <footer className="ww-guide__extra">
          {/* The hints stay (yellow border); the summary of the decision (blue border) stands at the very bottom. */}
          {stepExtras(view, describeRoleStep(state), t)}
          {view.deaths.length > 0 && <DeathDetails deaths={view.deaths} />}
          <Summary onReopen={onReopen} view={view} />
        </footer>
      </section>
    );
  }

  const step = describeRoleStep(state);
  const showPeople =
    selection.ability !== null &&
    (view.targets.length > 0 || selection.picks.length > 0 || view.canChooseNobody);
  // The green check confirms the step. It gets a blue frame when the step can be confirmed and there is nothing else to
  // do: a choice was made, or there is nothing to choose (a result, a call without a decision).
  const hasChoice = card.abilities.some((ability) => ability.available);
  const confirmReady =
    view.canContinue && (selection.ability !== null || selection.heal || !hasChoice);
  const extras = stepExtras(view, step, t);
  return (
    <section className="ww-guide ww-guide--sheet">
      <header className="ww-guide__head">
        {view.question !== null && !card.cover ? (
          <Script view={view} />
        ) : (
          <strong className="ww-guide__text">{stepTitle(view, step, t)}</strong>
        )}
        <span className="ww-guide__tools">
          {(selection.ability !== null || view.canUndo) && (
            <button
              aria-label={t("werewolfNarrator.guide.undo")}
              className="ww-guide__close"
              disabled={!view.canUndo}
              onClick={onUndo}
              title={t("werewolfNarrator.guide.undo")}
              type="button"
            >
              <Icon name="reset" />
            </button>
          )}
          {view.canCloseAbility && (
            <button
              aria-label={t("werewolfNarrator.guide.closeSelection")}
              className="ww-guide__close"
              onClick={onCloseAbility}
              title={t("werewolfNarrator.guide.closeSelection")}
              type="button"
            >
              <Icon name="close" />
            </button>
          )}
        </span>
      </header>
      <div className="ww-guide__body">
        {card.cover && (
          <ul className="ww-guide__rows">
            {card.abilities.map((ability) => (
              <li key={ability.id}>
                <WerewolfSymbol id={ability.symbol} size={20} />
                <span>
                  {t("werewolfNarrator.guide.coverRow", {
                    ability: t(`werewolfNarrator.ability.${ability.id}`),
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
        {state.status === "vote" && <Ballots onBallot={onBallot} view={view} />}
        {showPeople && (
          <div className="ww-guide__people">
            {/* All names in alphabetical order, the chosen ones in place, so a name is quickly found. */}
            {[...selection.picks, ...view.targets]
              .sort((one, other) => one.localeCompare(other, undefined, { sensitivity: "base" }))
              .map((name) => {
                const chosen = selection.picks.includes(name);
                return (
                  <button
                    aria-pressed={chosen}
                    className="ww-person"
                    key={name}
                    onClick={() => (chosen ? onUnchoose(name) : onChoose(name))}
                    title={name}
                    type="button"
                  >
                    <span className="ww-person__name">{name}</span>
                    <Mark name={name} view={view} />
                  </button>
                );
              })}
            {view.canChooseNobody && (
              <button
                aria-pressed={selection.none}
                className="ww-person ww-person--nobody"
                onClick={onNobody}
                type="button"
              >
                <span className="ww-person__name">{t("werewolfNarrator.guide.nobody")}</span>
              </button>
            )}
          </div>
        )}
      </div>
      {(extras.length > 0 || card.role !== "day" || selection.ability !== null) && (
        <footer className="ww-guide__extra">
          {extras}
          {/* The day has no strip, but the choice of people (nomination, vote) is confirmed like every other choice. */}
          {(card.role !== "day" || selection.ability !== null) &&
            !(selection.ability === null && view.question !== null) &&
            !(
              selection.ability === null &&
              step.skippable &&
              !selection.heal &&
              selection.picks.length === 0
            ) &&
            (selection.ability !== null ? (
              <button
                aria-label={t("werewolfNarrator.guide.confirm")}
                className="ww-guide__confirm"
                data-next={confirmReady || undefined}
                disabled={!view.canContinue}
                onClick={onContinue}
                title={t("werewolfNarrator.guide.confirm")}
                type="button"
              >
                <Icon name="check" />
              </button>
            ) : (
              <button
                className="ww-guide__strip"
                // A role that may do nothing (the investigator, the witch): the ability and this strip both have the frame.
                data-next={view.canContinue || undefined}
                disabled={!view.canContinue}
                onClick={onContinue}
                type="button"
              >
                <span>
                  {t(
                    step.skippable && !selection.heal && selection.picks.length === 0
                      ? "werewolfNarrator.guide.skip"
                      : "werewolfNarrator.guide.done",
                  )}
                </span>
                <Icon name="check" />
              </button>
            ))}
        </footer>
      )}
    </section>
  );
}

function PlainBox({ view }: { readonly view: GuideView }) {
  const { t } = useTranslation();
  const { state } = view;
  if (state.status === "roles") {
    const dealt = currentWerewolfRole(state);
    if (!dealt) return null;
    return (
      <DealCard
        amulet={state.amulet?.holder === dealt.name}
        key={dealt.name}
        mayor={state.settings.mayor}
        name={dealt.name}
        position={state.index + 1}
        role={dealt.role}
        total={state.players.length}
        variant={variantOfRole(dealt.role, state.settings)}
      />
    );
  }
  if (state.status === "morning") {
    const names = werewolfAnnouncement(state).map((entry) => entry.name);
    return (
      <section className="ww-guide ww-guide--sheet">
        <header className="ww-guide__head">
          <strong className="ww-guide__text">{t("werewolfNarrator.guide.morning.title")}</strong>
        </header>
        <div className="ww-guide__body">
          <span className="ww-guide__lead">
            {names.length === 0
              ? t("werewolfNarrator.guide.morning.nobody")
              : t("werewolfNarrator.guide.morning.died", { names: names.join(", ") })}
          </span>
        </div>
        {view.deaths.length > 0 && (
          <footer className="ww-guide__extra">
            <DeathDetails deaths={view.deaths} />
          </footer>
        )}
      </section>
    );
  }
  if (state.status === "exile") {
    const names = werewolfAnnouncement(state).map((entry) => entry.name);
    return (
      <section className="ww-guide ww-guide--sheet">
        <header className="ww-guide__head">
          <strong className="ww-guide__text">
            {t("werewolfNarrator.guide.exile", { name: state.victim.name })}
          </strong>
        </header>
        <div className="ww-guide__body">
          {names.length > 1 && (
            <span className="ww-guide__lead">
              {t("werewolfNarrator.guide.left", { names: names.join(", ") })}
            </span>
          )}
        </div>
        {view.deaths.length > 0 && (
          <footer className="ww-guide__extra">
            <DeathDetails deaths={view.deaths} />
          </footer>
        )}
      </section>
    );
  }
  if (state.status === "finished") return <WinnerList state={state} />;
  return null;
}

/** The winner view at the very end: every group of winners with the names of its players. */
function WinnerList({ state }: { readonly state: WerewolfState }) {
  const { t } = useTranslation();
  return (
    <section className="ww-guide ww-winners">
      <strong className="ww-guide__text">{t("werewolfNarrator.guide.finished.title")}</strong>
      <div className="ww-winners__groups">
        {describeWinners(state).map((group) => (
          <div className="ww-winners__group" key={group.kind}>
            <h4>
              <WerewolfSymbol
                id={
                  group.kind === "village"
                    ? "villager"
                    : group.kind === "wolves"
                      ? "wolf"
                      : group.kind === "tanner"
                        ? "tanner"
                        : "lovers"
                }
                size={22}
              />{" "}
              {t(`werewolfNarrator.guide.finished.${group.kind}`)}
            </h4>
            <ul>
              {group.players.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * The vote: one row for every voter with a button for each candidate. Nobody votes for himself. The row of the mayor with
 * the double vote says that the vote counts twice; the village idiot does not decide, the narrator sets his vote (as in
 * the original rules). A voter without a choice is marked.
 */
function Ballots({
  onBallot,
  view,
}: {
  readonly onBallot: (voter: string, candidate: string) => void;
  readonly view: GuideView;
}) {
  const { t } = useTranslation();
  return (
    <ul aria-label={t("werewolfNarrator.guide.ballots")} className="ww-ballots">
      {view.ballotRows.map((row) => (
        <li
          className="ww-ballot"
          data-missing={(row.choice === null && row.choices.length > 0) || undefined}
          key={row.name}
        >
          <span className="ww-ballot__name">
            <strong>{row.name}</strong>
            <Mark name={row.name} view={view} />
          </span>
          <span className="ww-ballot__choices">
            {row.choices.map((candidate) => (
              <button
                aria-pressed={row.choice === candidate}
                aria-label={t("werewolfNarrator.guide.ballotFor", { name: row.name, candidate })}
                className="ww-ballot__choice"
                key={candidate}
                onClick={() => onBallot(row.name, candidate)}
                type="button"
              >
                {candidate}
              </button>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The script of a role with several steps (the witch): one box for every question, from top to bottom, the open one
 * framed in blue; the ones that are done or still to come are dim.
 */
function Script({ view }: { readonly view: GuideView }) {
  const { t } = useTranslation();
  const { question, selection, state } = view;
  const victim = state.wolfTarget;
  // Every box has a number; where there is more than one thing to do, the tasks stand as a list.
  const steps = [
    {
      id: "heal",
      items: [
        victim
          ? t("werewolfNarrator.guide.witch.showVictim", { name: victim.name })
          : t("werewolfNarrator.guide.witch.showNoVictim"),
        t("werewolfNarrator.guide.witch.healAsk"),
      ],
    },
    {
      id: "poison",
      items: [
        selection.ability === "poison"
          ? t("werewolfNarrator.guide.ask.poison")
          : t("werewolfNarrator.guide.witch.poisonAsk"),
      ],
    },
  ] as const;
  return (
    <ol className="ww-script">
      {steps.map((step) => (
        <li
          className="ww-script__step"
          data-state={step.id === question ? "active" : step.id === "heal" ? "done" : "pending"}
          key={step.id}
        >
          <ul className="ww-script__items">
            {step.items.map((item) => (
              <li className="ww-script__item" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

/** A small mark behind a name in the list of voters: the mayor counts twice, the village idiot has to vote yes. */
function Mark({ view, name }: { readonly view: GuideView; readonly name: string }) {
  const { t } = useTranslation();
  const note = view.voterNotes[name];
  return note ? (
    <small className="ww-person__mark"> {t(`werewolfNarrator.guide.voter.${note}`)}</small>
  ) : null;
}

/** The blue box of the summary with a small reset button: it takes the decision back, so the role can decide anew. */
function Chosen({
  children,
  onReopen,
}: {
  readonly children: ReactNode;
  readonly onReopen: () => void;
}) {
  const { t } = useTranslation();
  return (
    <span className="ww-guide__chosen">
      <span>{children}</span>
      <button
        aria-label={t("werewolfNarrator.guide.reopen")}
        className="ww-guide__reset"
        onClick={onReopen}
        title={t("werewolfNarrator.guide.reopen")}
        type="button"
      >
        <Icon name="reset" />
      </button>
    </span>
  );
}

/** What the narrator chose in this step, so it can be checked before the role falls asleep. */
function Summary({ view, onReopen }: { readonly view: GuideView; readonly onReopen: () => void }) {
  const { t } = useTranslation();
  const { card, selection } = view;
  if (!card || card.cover || card.abilities.length === 0) return null;
  // The werewolves do not attack in the first night (setting): the role does not "pass", there is simply no attack.
  const step = describeRoleStep(view.state);
  if (step.statement === "noAttack")
    return (
      <span className="ww-guide__chosen">{t("werewolfNarrator.guide.wolvesNoAttackDone")}</span>
    );
  // The result of the seer or the investigator is shown: the choice is already in the game, not in the selection.
  if (step.result) {
    const { ability, name } = step.result;
    return (
      <Chosen onReopen={onReopen}>
        {t("werewolfNarrator.guide.chosen", {
          items: `${t(`werewolfNarrator.guide.abilityDone.${ability}`)}: ${name}`,
        })}
      </Chosen>
    );
  }
  // The holder of the amulet decided to keep it.
  if (step.skip.summary === "kept" && selection.picks.length === 0)
    return (
      <Chosen onReopen={onReopen}>
        {t("werewolfNarrator.guide.amuletKept", { name: view.state.amulet?.holder ?? "" })}
      </Chosen>
    );
  const parts: string[] = [];
  if (selection.heal) parts.push(t("werewolfNarrator.guide.abilityDone.heal"));
  // The witch and the magician close the list of people with the check mark: the people stay chosen for their spell.
  const chosenAbility =
    selection.ability !== null && selection.ability !== "heal"
      ? selection.ability
      : selection.ability === null && selection.picks.length > 0
        ? step.compound === "castSpells"
          ? "kill"
          : step.compound === "potions"
            ? "poison"
            : null
        : null;
  if (chosenAbility) {
    const people =
      selection.none || selection.picks.length === 0
        ? t("werewolfNarrator.guide.nobody")
        : selection.picks.join(", ");
    parts.push(`${t(`werewolfNarrator.guide.abilityDone.${chosenAbility}`)}: ${people}`);
  }
  return (
    <Chosen onReopen={onReopen}>
      {parts.length > 0
        ? t("werewolfNarrator.guide.chosen", { items: parts.join(" · ") })
        : t("werewolfNarrator.guide.noChoice")}
    </Chosen>
  );
}

/** Why somebody leaves the game: for the narrator only, not to be read out. */
function DeathDetails({ deaths }: { readonly deaths: GuideView["deaths"] }) {
  const { t } = useTranslation();
  if (deaths.length === 0) return null;
  return (
    <div className="ww-guide__causes">
      <small>{t("werewolfNarrator.guide.causesTitle")}</small>
      <ul>
        {deaths.map((death) => (
          <li key={death.name}>
            <strong>{death.name}</strong>
            {": "}
            {death.causes.map((cause) => t(`werewolfNarrator.cause.${cause}`)).join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Between the role reveal and the game: the last player hands the device back. Nothing of the game is shown here; the
 * button below says "begin" and starts the first step of the night.
 */
function ReadyBox() {
  const { t } = useTranslation();
  return (
    <section className="ww-guide ww-ready">
      <div className="ww-ready__stage">
        <span aria-hidden="true" className="ww-ready__symbol">
          <Icon name="cards" />
        </span>
        <strong className="ww-ready__title">{t("werewolfNarrator.guide.ready.title")}</strong>
      </div>
      <p className="ww-ready__hint">
        <Icon name="hand" />
        <span>{t("werewolfNarrator.guide.ready.hint")}</span>
      </p>
    </section>
  );
}

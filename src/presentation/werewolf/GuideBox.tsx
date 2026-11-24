import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { type GuideView } from "../../business/games/werewolf/narratorGuide";
import { describeRoleStep } from "../../business/games/werewolf/roleStep";
import { Icon } from "../components";
import type { VoteProps } from "./NarratorCard";
import { PlainBox } from "./GuidePlainBox";
import { Summary } from "./GuideSummary";
import { VoteInput } from "./VoteInput";
import { ThumbIcon } from "./RoleStepContent";
import { dayPrompt, factOf, scriptOf, stepExtras, stepTitle, type ScriptBox } from "./stepText";
import type { SymbolId } from "./symbols/catalog";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";

interface GuideBoxProps {
  readonly view: GuideView;
  /** The vote: the lower box is where the votes are entered (the upper box only shows them). */
  readonly votes?: VoteProps | undefined;
  readonly onChoose: (name: string) => void;
  readonly onCheck: () => void;
  readonly onCloseAbility: () => void;
  readonly onContinue: () => void;
  readonly onReopen: () => void;
  readonly onUndoQuestion: (question: "heal" | "poison") => void;
  readonly onUndo: () => void;
  readonly onUnchoose: (name: string) => void;
}

/**
 * The lower box of the narrator view: it says what the narrator reads aloud or does now. A tap on the box goes on
 * where nothing has to be decided; where a person has to be chosen, the people are listed here.
 */
export function GuideBox({
  view,
  votes,
  onCheck,
  onChoose,
  onCloseAbility,
  onContinue,
  onReopen,
  onUndo,
  onUndoQuestion,
  onUnchoose,
}: GuideBoxProps) {
  const { t } = useTranslation();
  const { card, phase, selection, state } = view;

  if (phase === "ready") return <ReadyBox />;
  if (phase === "plain") return <PlainBox view={view} />;
  if (!card) return null;

  if (phase === "intro") {
    // The box "the role wakes up" is the first box of the script; its check shows the role.
    const script = scriptOf(view, describeRoleStep(state), t);
    return (
      <section className="ww-guide ww-guide--sheet">
        <header className="ww-guide__head">
          {script && (
            <RoleScript
              boxes={script}
              onCheck={onCheck}
              onContinue={onContinue}
              onReopen={onReopen}
              onUndo={onUndo}
              onUndoQuestion={onUndoQuestion}
              outro={view.phase === "outro"}
              question={view.question}
              role={card.role}
            />
          )}
        </header>
        <div className="ww-guide__body" />
      </section>
    );
  }

  if (phase === "outro") {
    // The role is asleep again. Below the script (its boxes, with the undo buttons) stands the box that says so, always in
    // the blue frame; going on to the next role is the job of the button "next". The blue summary at the bottom only sums up.
    const outroStep = describeRoleStep(state);
    const script = scriptOf(view, outroStep, t);
    return (
      <section className="ww-guide ww-guide--sheet ww-guide--asleep">
        <header className="ww-guide__head">
          {script && (
            <RoleScript
              boxes={script}
              onCheck={onCheck}
              onContinue={onContinue}
              onReopen={onReopen}
              onUndo={onUndo}
              onUndoQuestion={onUndoQuestion}
              outro={view.phase === "outro"}
              question={view.question}
              role={card.role}
            />
          )}
        </header>
        <div className="ww-guide__body" />
        <footer className="ww-guide__extra">
          {/* The hints stay (yellow border); the summary of the decision (blue border) stands at the very bottom. */}
          {stepExtras(view, outroStep, t)}
          <Summary view={view} />
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
  const isVote = state.status === "vote" && votes !== undefined;
  const extras = isVote ? [] : stepExtras(view, step, t);
  const script = scriptOf(view, step, t);
  // A step with a result (what the seer sees, who the drunk is): the summary box shows it at once.
  const showFact = factOf(view, t) !== null;
  // The summary stands while the step is open only where something is already decided: a result, Cupid's lovers once
  // they are confirmed, or "no vote" at the day. (The witch and the magician have nothing to sum up before their step is
  // done.)
  const showSummary =
    showFact ||
    view.bondDone ||
    (state.status === "day" && view.progress >= 1) ||
    // The day after a vote: who left the game.
    (state.status === "day" && view.votedToday) ||
    // The witch and the magician: after the answer to the first question the summary already says what was decided.
    (view.potionRole !== null && view.question === "poison") ||
    false;
  return (
    <section className="ww-guide ww-guide--sheet">
      <header className="ww-guide__head">
        {isVote && votes ? (
          // The vote works like the choice of people: cancel at the top right, confirm at the bottom right.
          <span className="ww-vote__top">
            <strong className="ww-guide__text">{dayPrompt(view, t)}</strong>
            <button
              aria-label={t("werewolfNarrator.guide.vote.cancel")}
              className="ww-guide__close"
              onClick={votes.onCancel}
              title={t("werewolfNarrator.guide.vote.cancel")}
              type="button"
            >
              <Icon name="close" />
            </button>
          </span>
        ) : showPeople ? (
          // Choosing people: the list covers the whole box. Neither the script nor the hints stand there; only the
          // buttons to take the choice back and to close the list.
          <span className="ww-guide__tools ww-guide__tools--bar">
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
            <button
              aria-label={t("werewolfNarrator.guide.closeSelection")}
              className="ww-guide__close"
              disabled={!view.canCloseAbility}
              onClick={onCloseAbility}
              title={t("werewolfNarrator.guide.closeSelection")}
              type="button"
            >
              <Icon name="close" />
            </button>
          </span>
        ) : script ? (
          <RoleScript
            boxes={script}
            onCheck={onCheck}
            onContinue={onContinue}
            onReopen={onReopen}
            onUndo={onUndo}
            onUndoQuestion={onUndoQuestion}
            outro={view.phase === "outro"}
            question={view.question}
            role={card.role}
          />
        ) : (
          <div className="ww-script__row">
            <div className="ww-script__step" data-state="active">
              <strong className="ww-guide__text">{stepTitle(view, step, t)}</strong>
            </div>
          </div>
        )}
      </header>
      <div className="ww-guide__body">
        {isVote && votes && <VoteInput votes={votes} />}
        {showPeople && (
          <div className="ww-guide__people">
            {/* Every player is always there, in the same order (alphabetical): the dead are grey, those whom the role
                may not choose now have a dashed frame, the others can be chosen. Nothing moves when the state changes. */}
            {[...state.players]
              .map((player) => player.name)
              .sort((one, other) => one.localeCompare(other, undefined, { sensitivity: "base" }))
              .map((name) => {
                const chosen = selection.picks.includes(name);
                // The hunter who shoots is out of the game already, but he has not finished: he is not shown as dead (he
                // cannot be chosen, so he stands there as "not possible").
                const shooter = view.shooter === name;
                const dead = !state.alive.some((player) => player.name === name) && !shooter;
                const blocked = !dead && !chosen && !view.targets.includes(name);
                return (
                  <button
                    aria-pressed={chosen}
                    className="ww-person"
                    data-state={dead ? "dead" : blocked ? "blocked" : undefined}
                    disabled={dead || blocked}
                    key={name}
                    onClick={() => (chosen ? onUnchoose(name) : onChoose(name))}
                    title={name}
                    type="button"
                  >
                    <span className="ww-person__name">
                      {dead && <WerewolfSymbol id="dead" size={14} />}
                      {name}
                    </span>
                    <Mark name={name} view={view} />
                  </button>
                );
              })}
          </div>
        )}
      </div>
      {(extras.length > 0 || selection.ability !== null || showSummary || isVote) && (
        <footer className="ww-guide__extra">
          {!showPeople && extras}
          {isVote && votes && (
            <span className="ww-vote__leader" data-complete={votes.complete}>
              {votes.leader}
            </span>
          )}
          {isVote && votes && (
            <button
              aria-label={t(
                votes.tie ? "werewolfNarrator.guide.vote.again" : "werewolfNarrator.guide.confirm",
              )}
              className="ww-guide__confirm"
              data-next={votes.canConfirm || undefined}
              disabled={!votes.canConfirm}
              onClick={votes.onConfirm}
              title={t(
                votes.tie ? "werewolfNarrator.guide.vote.again" : "werewolfNarrator.guide.confirm",
              )}
              type="button"
            >
              <Icon name={votes.tie ? "repeat" : "check"} />
            </button>
          )}
          {/* Cupid: once the choice is confirmed in the first box, the summary stands here. */}
          {!showPeople && showSummary && <Summary view={view} />}
          {/* The choice of people (also at the day) is confirmed with the check below the list. */}
          {selection.ability !== null && view.state.status !== "vote" && (
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
          )}
        </footer>
      )}
    </section>
  );
}

function withNames(text: ReactNode, names: readonly string[] | undefined, red?: string): ReactNode {
  // "[thumb]" in a text is the sign of a thumb up, "[br]" a line break.
  if (typeof text === "string" && /\[(thumb|br)\]/.test(text)) {
    return text
      .split(/(\[thumb\]|\[br\])/)
      .map((part, index) =>
        part === "[thumb]" ? (
          <ThumbIcon key={index} />
        ) : part === "[br]" ? (
          <br key={index} />
        ) : (
          part
        ),
      );
  }
  if (typeof text === "string" && red && text.includes(red)) {
    const at = text.indexOf(red);
    return (
      <>
        {text.slice(0, at)}
        <span className="ww-red">{red}</span>
        {text.slice(at + red.length)}
      </>
    );
  }
  if (typeof text !== "string" || !names || names.length === 0) return text;
  const escaped = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return text.split(new RegExp("(" + escaped.join("|") + ")")).map((part, index) =>
    names.includes(part) ? (
      <b className="ww-name" key={index}>
        {part}
      </b>
    ) : (
      part
    ),
  );
}

/**
 * The script of a role: one box per task from top to bottom, all visible from the start, the open one framed in blue.
 * Right of every box except the last one stands a button: take the decision back, or confirm that the task is done.
 */
function RoleScript({
  boxes,
  onCheck,
  onContinue,
  onReopen,
  onUndo,
  onUndoQuestion,
  outro,
  question,
  role,
}: {
  readonly outro: boolean;
  /** The question of the witch that is open (null for every other role). */
  readonly question: "heal" | "poison" | null;
  readonly boxes: readonly ScriptBox[];
  readonly onCheck: () => void;
  readonly onContinue: () => void;
  readonly onReopen: () => void;
  readonly onUndo: () => void;
  readonly onUndoQuestion: (question: "heal" | "poison") => void;
  readonly role: string;
}) {
  const { t } = useTranslation();
  const label = (box: ScriptBox) =>
    t(
      box.id === "wake"
        ? "werewolfNarrator.guide.showRole"
        : box.button === "check"
          ? "werewolfNarrator.guide.taskDone"
          : box.id === "heal" ||
              box.id === "poison" ||
              box.id === "show" ||
              box.id === "discuss" ||
              (box.id === "decide" && !outro)
            ? "werewolfNarrator.guide.undo"
            : "werewolfNarrator.guide.reopen",
    );
  const press = (box: ScriptBox) => {
    if (box.id === "heal" || box.id === "poison") onUndoQuestion(box.id);
    else if (box.button === "check")
      (box.id === "asleep" || box.id === "touch" || box.id === "show" || box.id === "discuss"
        ? onCheck
        : onContinue)();
    else if (box.id === "show" && question !== null) (outro ? onReopen : onUndo)();
    else if (box.id === "show") (outro ? onReopen : onUndo)();
    else (outro ? onReopen : onUndo)();
  };
  return (
    <div className="ww-script">
      {boxes.map((box) => (
        <div className="ww-script__row" key={box.id}>
          <div className="ww-script__step" data-state={box.state}>
            {box.id === "asleep" || box.id === "wake" ? (
              <span className="ww-guide__heading">
                <strong className="ww-guide__text">
                  <WerewolfSymbol id={role as SymbolId} size={32} />
                  {box.items[0]}
                </strong>
              </span>
            ) : (
              <span className="ww-script__content">
                {box.symbols ? (
                  <span className="ww-script__symbols">
                    {box.symbols.map((symbol) => (
                      <WerewolfSymbol id={symbol as SymbolId} key={symbol} ring size={24} />
                    ))}
                  </span>
                ) : (
                  box.symbol && <WerewolfSymbol id={box.symbol as SymbolId} ring size={28} />
                )}
                {box.items.length > 1 ? (
                  <ul className="ww-script__items">
                    {box.items.map((item, index) => (
                      <li className="ww-script__item" key={index}>
                        {withNames(item, box.names, box.red)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <strong className="ww-guide__text">
                    {withNames(box.items[0], box.names, box.red)}
                  </strong>
                )}
              </span>
            )}
          </div>
          {box.button !== null && (
            <button
              aria-label={label(box)}
              className={
                box.button === "undo"
                  ? "ww-script__undo"
                  : box.id === "wake"
                    ? "ww-script__undo ww-script__check ww-script__wake"
                    : "ww-script__undo ww-script__check"
              }
              disabled={!box.enabled}
              onClick={() => press(box)}
              title={label(box)}
              type="button"
            >
              <Icon name={box.button === "undo" ? "reset" : "check"} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function Mark({ view, name }: { readonly view: GuideView; readonly name: string }) {
  const { t } = useTranslation();
  const note = view.voterNotes[name];
  return note ? (
    <small className="ww-person__mark"> {t(`werewolfNarrator.guide.voter.${note}`)}</small>
  ) : null;
}

/** The blue box of the summary: it only sums up the decisions; taking them back is the job of the undo buttons at the script. */
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
        {/* The first words of the narrator before the night begins: everybody goes to sleep. */}
        <p className="ww-ready__script">{t("werewolfNarrator.guide.day.villageSleeps")}</p>
      </div>
      <p className="ww-ready__hint">
        <Icon name="hand" />
        <span>{t("werewolfNarrator.guide.ready.hint")}</span>
      </p>
    </section>
  );
}

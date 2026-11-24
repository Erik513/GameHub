import { Fragment, useState, type ReactNode } from "react";
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
import type { VoteProps } from "./NarratorCard";
import { VoteInput } from "./VoteInput";
import { ThumbIcon, Verdict } from "./RoleStepContent";
import { variantOfRole } from "./roleAbilities";
import { lineGlyphs } from "./symbols/glyphs";
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
    ((state.status === "cupid" || state.status === "day") && view.progress >= 1) ||
    // The day after a vote: who left the game.
    (state.status === "day" && view.votedToday) ||
    // The witch and the magician: after the answer to the first question the summary already says what was decided.
    ((state.status === "witch" || state.status === "magician") && view.question === "poison") ||
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
        {card.cover && (
          <ul className="ww-guide__rows">
            {card.abilities.map((ability) => (
              <li key={ability.id}>
                <WerewolfSymbol id={ability.symbol} ring size={20} />
                <span>
                  {t("werewolfNarrator.guide.coverRow", {
                    ability: t(`werewolfNarrator.ability.${ability.id}`),
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
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
                const shooter =
                  (state.status === "hunter" || state.status === "drunkHunter") &&
                  state.hunter.name === name;
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

function PlainBox({ view }: { readonly view: GuideView }) {
  const { t } = useTranslation();
  const { state } = view;
  // The people of the morning whose reason of death is shown: a tap shows it, another tap covers it again.
  const [shown, setShown] = useState<readonly string[]>([]);
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
          {names.length === 0 ? (
            <span className="ww-guide__lead">{t("werewolfNarrator.guide.morning.nobody")}</span>
          ) : (
            // Every dead person in a box of their own, one below the other: only names, never a role. The hunter is
            // dead but still shoots: he stands in a category of his own ("last shot"), and his role is public.
            (() => {
              const isHunter = (name: string) =>
                state.players.some((player) => player.name === name && player.role === "hunter");
              const dead = names.filter((name) => !isHunter(name));
              const shooters = names.filter(isHunter);
              const deathOf = (name: string) => view.deaths.find((death) => death.name === name);
              const box = (name: string, hunter: boolean) => (
                // The whole box is the button: a tap anywhere in it (also in the opened part) shows or covers the reason.
                // (The button inside keeps the keyboard and the screen reader working; its click reaches the box.)
                <li
                  data-role={hunter ? "hunter" : undefined}
                  key={name}
                  onClick={() =>
                    setShown((now) =>
                      now.includes(name) ? now.filter((other) => other !== name) : [...now, name],
                    )
                  }
                >
                  <button aria-expanded={shown.includes(name)} type="button">
                    <span className="ww-guide__dead-name">
                      {/* A closed eye while the reason is covered, an open one while it is shown. */}
                      <EyeIcon open={shown.includes(name)} />
                      {name}
                      {/* The role stands in brackets behind the name once the person is tapped (the hunter shows it always). */}
                      {shown.includes(name) && !hunter && deathOf(name) && (
                        <> ({t(`werewolfSymbols.items.${deathOf(name)!.role as SymbolId}.name`)})</>
                      )}
                    </span>
                    {hunter && (
                      <span className="ww-guide__dead-role">
                        <WerewolfSymbol id="hunter" size={22} />
                        {t("werewolfSymbols.items.hunter.name")}
                      </span>
                    )}
                  </button>
                  {shown.includes(name) && (
                    <div className="ww-guide__dead-causes">
                      <span className="ww-guide__dead-reason">
                        <small>{t("werewolfNarrator.guide.causesTitle")}</small>
                        <span>
                          {(deathOf(name)?.causes ?? [])
                            .map((cause) => t(`werewolfNarrator.cause.${cause}`))
                            .join(", ")}
                        </span>
                      </span>
                      {/* A place at the bottom right is always kept for the amulet that is lost with this death. */}
                      <span
                        className="ww-guide__dead-slot"
                        data-filled={deathOf(name)?.amuletLost === true ? true : undefined}
                      >
                        {deathOf(name)?.amuletLost && (
                          <WerewolfSymbol
                            id="amulet"
                            label={t("werewolfNarrator.guide.amuletLost")}
                            size={22}
                          />
                        )}
                      </span>
                    </div>
                  )}
                </li>
              );
              return (
                <>
                  {dead.length > 0 && (
                    <div className="ww-guide__dead">
                      <strong>{t("werewolfNarrator.guide.morning.died")}</strong>
                      <small>{t("werewolfNarrator.guide.causesHint")}</small>
                      <ul>{dead.map((name) => box(name, false))}</ul>
                    </div>
                  )}
                  {shooters.length > 0 && (
                    <div className="ww-guide__dead">
                      <strong>{t("werewolfNarrator.guide.morning.lastShot")}</strong>
                      {dead.length === 0 && <small>{t("werewolfNarrator.guide.causesHint")}</small>}
                      <ul>{shooters.map((name) => box(name, true))}</ul>
                    </div>
                  )}
                </>
              );
            })()
          )}
        </div>
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
/** A text with the player names in bold, so they stand out when the narrator reads. */
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

/** An eye: closed while something is covered, open while it is shown (the drawings are those of the symbols). */
function EyeIcon({ open }: { readonly open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="ww-guide__eye"
      data-eye={open ? "open" : "closed"}
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="20"
    >
      {lineGlyphs[open ? "eye" : "eyeClosed"].map((d) => (
        <path d={d} key={d} />
      ))}
    </svg>
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

/** The blue box of the summary: it only sums up the decisions; taking them back is the job of the undo buttons at the script. */
function Chosen({ children }: { readonly children: ReactNode }) {
  return <span className="ww-guide__chosen">{children}</span>;
}

/** The small "i" in a circle (the drawing of the info buttons): the line behind it is extra information, not a decision. */
function InfoMark() {
  return (
    <svg aria-hidden="true" focusable="false" height="20" viewBox="0 0 24 24" width="20">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 11v5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
      <circle cx="12" cy="7.8" r="1.3" fill="currentColor" />
    </svg>
  );
}

/** What the narrator chose in this step, so it can be checked before the role falls asleep. */
function Summary({ view }: { readonly view: GuideView }) {
  const { t } = useTranslation();
  const { card, selection } = view;
  if (!card || card.cover) return null;
  // The vote: who was nominated.
  if (view.state.status === "vote")
    return (
      <Chosen>
        <span className="ww-guide__chosen-part">
          <WerewolfSymbol id="vote" ring size={20} />
          <span>
            {t("werewolfNarrator.guide.day.chosen", { names: view.state.candidates.join(", ") })}
          </span>
        </span>
      </Chosen>
    );
  // The day: the only thing to sum up is "no vote" (the vote itself has its own steps).
  if (view.state.status === "day")
    return view.progress >= 1 || view.votedToday ? (
      <Chosen>
        {view.exiledToday.map((name) => (
          <Fragment key={name}>
            <span className="ww-guide__chosen-part">
              <WerewolfSymbol id="vote" ring size={20} />
              <span>{t("werewolfNarrator.guide.exile", { name })}</span>
            </span>
            {/* The tanner who was voted out has won: he keeps his role secret until the end of the game. */}
            {name === view.state.tannerWinner && (
              <span className="ww-guide__chosen-part">
                <WerewolfSymbol id="tanner" size={20} />
                <span>{t("werewolfNarrator.guide.tannerWon", { name })}</span>
              </span>
            )}
          </Fragment>
        ))}
        {/* A vote without anybody leaving (a tie, too few yes votes). */}
        {view.votedToday && view.exiledToday.length === 0 && (
          <span className="ww-guide__chosen-part">
            <WerewolfSymbol id="vote" ring size={20} />
            <span>{t("werewolfNarrator.guide.nobodyLeft")}</span>
          </span>
        )}
        {view.progress >= 1 && (
          <span className="ww-guide__chosen-part">
            <WerewolfSymbol id="vote" ring size={20} />
            <strong>{t("werewolfNarrator.guide.noVote")}</strong>
          </span>
        )}
      </Chosen>
    ) : null;
  // The wolves who skipped: no attack.
  if (view.state.status === "wolves" && selection.picks.length === 0 && view.phase === "outro")
    return <Chosen>{t("werewolfNarrator.guide.wolvesNoAttackDone")}</Chosen>;
  const step = describeRoleStep(view.state);
  const fact = factOf(view, t);
  // The drunk has no ability: the summary only says who he really is.
  if (card.abilities.length === 0)
    return view.state.status === "drunkReveal" || view.state.status === "drunkHunter" ? (
      <Chosen>{fact?.text}</Chosen>
    ) : null;
  // What was used, as the symbol of the ability, its name and the person: no prefix ("chosen").
  const part = (symbol: string, label: string, people: string) => (
    <span className="ww-guide__chosen-part" key={symbol + label}>
      <WerewolfSymbol id={symbol as SymbolId} ring size={20} />
      <span>
        <strong>{label}</strong>
        {": "}
        {people}
      </span>
    </span>
  );
  const symbolOf = (id: string) =>
    card.abilities.find((ability) => ability.id === id)?.symbol ?? "vote";
  // The werewolves do not attack in the first night (setting): the role does not "pass", there is simply no attack.
  if (step.statement === "noAttack")
    return <Chosen>{t("werewolfNarrator.guide.wolvesNoAttackDone")}</Chosen>;
  // The result of the seer or the investigator is shown: the choice is already in the game, not in the selection.
  if (step.result) {
    const { ability, name } = step.result;
    return (
      <Chosen>
        {/* "Looked at: Josie (Not a werewolf)": the verdict stands in the summary, green for a werewolf, red if not. */}
        <span className="ww-guide__chosen-part">
          <WerewolfSymbol id={symbolOf(ability)} ring size={20} />
          <span>
            <strong>{t(`werewolfNarrator.guide.abilityDone.${ability}`)}</strong>
            {": "}
            {name}
            {fact && (
              <>
                {" ("}
                <Verdict found={fact.wolf === true} text={fact.text} />
                {")"}
              </>
            )}
          </span>
        </span>
        {/* The investigator: in a second line all three people he looked at, green for a werewolf, red for not (extra information). */}
        {ability === "investigate" && view.investigated.length > 0 && (
          <span className="ww-guide__chosen-part">
            <InfoMark />
            <span>
              {"("}
              {view.investigated.map((person, index) => (
                <Fragment key={person.name}>
                  {index > 0 && " · "}
                  <span className="ww-verdict" data-wolf={person.wolf}>
                    {person.name}
                  </span>
                </Fragment>
              ))}
              {")"}
            </span>
          </span>
        )}
      </Chosen>
    );
  }
  // The holder of the amulet decided to keep it.
  if (step.skip.summary === "kept" && selection.picks.length === 0)
    return (
      <Chosen>
        <span className="ww-guide__chosen-part">
          <WerewolfSymbol id="amuletPass" size={20} />
          <span>
            {t("werewolfNarrator.guide.amuletKept", { name: view.state.amulet?.holder ?? "" })}
          </span>
        </span>
      </Chosen>
    );
  const parts: ReactNode[] = [];
  const skipped = t("werewolfNarrator.guide.answeredNo");
  const magician = view.state.status === "magician";
  if (view.state.status === "witch" || magician) {
    // The witch and the magician: one row for every question that was answered, in the words of the script ("Save the
    // victim", "Poison somebody", ...), with what was decided or "skipped". The first question of the magician is
    // answered with a healing or with a death spell; the people of the first question stand before the later ones.
    const firstAnswered = view.question === "poison" || view.phase === "outro";
    const firstKills = magician ? selection.picks.slice(0, selection.spellPicks ?? 0) : [];
    const laterPicks = selection.picks.slice(firstKills.length);
    const second = magician ? "kill" : "poison";
    if (firstAnswered) {
      if (selection.heal)
        parts.push(
          part(
            symbolOf("heal"),
            t("werewolfNarrator.guide.abilityDone.heal"),
            view.state.wolfTarget?.name ?? t("werewolfNarrator.guide.nobody"),
          ),
        );
      else if (firstKills.length > 0)
        parts.push(
          part(
            symbolOf("kill"),
            t("werewolfNarrator.guide.abilityDone.kill"),
            firstKills.join(", "),
          ),
        );
      else
        parts.push(
          part(
            symbolOf("heal"),
            t(
              magician
                ? "werewolfNarrator.guide.summaryAsk.magicianFirst"
                : "werewolfNarrator.guide.summaryAsk.heal",
            ),
            skipped,
          ),
        );
    }
    if (laterPicks.length > 0)
      parts.push(
        part(
          symbolOf(second),
          t(`werewolfNarrator.guide.abilityDone.${second}`),
          laterPicks.join(", "),
        ),
      );
    else if (view.phase === "outro")
      parts.push(
        part(
          symbolOf(second),
          t(
            magician
              ? "werewolfNarrator.guide.summaryAsk.magicianSecond"
              : "werewolfNarrator.guide.summaryAsk.poison",
          ),
          skipped,
        ),
      );
  } else {
    // Cupid (and every other role with a list of people): what was chosen.
    const chosenAbility =
      selection.ability !== null && selection.ability !== "heal"
        ? selection.ability
        : selection.ability === null && selection.picks.length > 0 && step.compound === "bond"
          ? "bond"
          : null;
    if (chosenAbility) {
      const people =
        selection.none || selection.picks.length === 0
          ? t("werewolfNarrator.guide.nobody")
          : selection.picks.join(", ");
      parts.push(
        part(
          symbolOf(chosenAbility),
          t(`werewolfNarrator.guide.abilityDone.${chosenAbility}`),
          people,
        ),
      );
    }
  }
  const answeredNo = view.phase === "act" && view.question === "poison";
  return (
    <Chosen>
      {parts.length > 0
        ? parts
        : t(answeredNo ? "werewolfNarrator.guide.answeredNo" : "werewolfNarrator.guide.noChoice")}
    </Chosen>
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

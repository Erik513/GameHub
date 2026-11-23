import { useState, type ReactNode } from "react";
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
import { ThumbIcon, Verdict } from "./RoleStepContent";
import { variantOfRole } from "./roleAbilities";
import { lineGlyphs } from "./symbols/glyphs";
import { factOf, scriptOf, stepExtras, stepTitle, type ScriptBox } from "./stepText";
import type { SymbolId } from "./symbols/catalog";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";

interface GuideBoxProps {
  readonly view: GuideView;
  readonly onChoose: (name: string) => void;
  readonly onCheck: () => void;
  readonly onCloseAbility: () => void;
  readonly onContinue: () => void;
  readonly onBallot: (voter: string, candidate: string) => void;
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
  onCheck,
  onChoose,
  onCloseAbility,
  onContinue,
  onBallot,
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
  const extras = stepExtras(view, step, t);
  const script = scriptOf(view, step, t);
  // A step with a result (what the seer sees, who the drunk is): the summary box shows it at once.
  const showFact = factOf(view, t) !== null;
  // The summary stands while the step is open only where something is already decided: a result, Cupid's lovers once
  // they are confirmed, or "no vote" at the day. (The witch and the magician have nothing to sum up before their step is
  // done.)
  const showSummary =
    showFact ||
    ((state.status === "cupid" || state.status === "day") && view.progress >= 1) ||
    // The witch and the magician: after the answer to the first question the summary already says what was decided.
    ((state.status === "witch" || state.status === "magician") && view.question === "poison") ||
    // The vote: the nominated people were decided before it started.
    state.status === "vote";
  return (
    <section className="ww-guide ww-guide--sheet">
      <header className="ww-guide__head">
        {showPeople ? (
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
        {state.status === "vote" && <Ballots onBallot={onBallot} view={view} />}
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
      {(extras.length > 0 || selection.ability !== null || showSummary) && (
        <footer className="ww-guide__extra">
          {!showPeople && extras}
          {/* Cupid: once the choice is confirmed in the first box, the summary stands here. */}
          {!showPeople && showSummary && <Summary view={view} />}
          {/* The choice of people (also at the day) is confirmed with the check below the list. */}
          {selection.ability !== null && (
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
              const box = (name: string, hunter: boolean) => (
                <li data-role={hunter ? "hunter" : undefined} key={name}>
                  <button
                    aria-expanded={shown.includes(name)}
                    onClick={() =>
                      setShown((now) =>
                        now.includes(name) ? now.filter((other) => other !== name) : [...now, name],
                      )
                    }
                    type="button"
                  >
                    <span className="ww-guide__dead-name">
                      {/* A closed eye while the reason is covered, an open one while it is shown. */}
                      <EyeIcon open={shown.includes(name)} />
                      {name}
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
                      <small>{t("werewolfNarrator.guide.causesTitle")}</small>
                      <span>
                        {(view.deaths.find((death) => death.name === name)?.causes ?? [])
                          .map((cause) => t(`werewolfNarrator.cause.${cause}`))
                          .join(", ")}
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
    return view.progress >= 1 ? (
      <Chosen>
        <span className="ww-guide__chosen-part">
          <WerewolfSymbol id="vote" ring size={20} />
          <strong>{t("werewolfNarrator.guide.noVote")}</strong>
        </span>
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
  if (selection.heal)
    parts.push(
      part(
        symbolOf("heal"),
        t("werewolfNarrator.guide.abilityDone.heal"),
        view.state.wolfTarget?.name ?? t("werewolfNarrator.guide.nobody"),
      ),
    );
  // The witch and the magician close the list of people with the check mark: the people stay chosen for their spell.
  const chosenAbility =
    selection.ability !== null && selection.ability !== "heal"
      ? selection.ability
      : selection.ability === null && selection.picks.length > 0
        ? step.compound === "castSpells"
          ? "kill"
          : step.compound === "potions"
            ? "poison"
            : step.compound === "bond"
              ? "bond"
              : null
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
  // The first question is answered with "skip": that is a decision as well, the second question is still open.
  const answeredNo = view.phase === "act" && view.question === "poison";
  return (
    <Chosen>
      {parts.length > 0
        ? parts
        : t(answeredNo ? "werewolfNarrator.guide.answeredNo" : "werewolfNarrator.guide.noChoice")}
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

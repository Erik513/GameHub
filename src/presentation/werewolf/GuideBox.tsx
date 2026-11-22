import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { describeWinners, type GuideView } from "../../business/games/werewolf/narratorGuide";
import {
  currentWerewolfRole,
  werewolfAnnouncement,
  werewolfDrunkReveal,
  type WerewolfState,
} from "../../business/games/werewolf/stateMachine";
import { Icon } from "../components";
import { DealCard } from "./DealCard";
import { variantOfRole } from "./roleAbilities";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";

interface GuideBoxProps {
  readonly view: GuideView;
  readonly onChoose: (name: string) => void;
  readonly onCloseAbility: () => void;
  readonly onContinue: () => void;
  readonly onNobody: () => void;
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
  onNobody,
  onUndo,
  onUnchoose,
}: GuideBoxProps) {
  const { t } = useTranslation();
  const { card, phase, selection, state } = view;

  if (phase === "ready") return <ReadyBox />;
  if (phase === "plain") return <PlainBox view={view} />;
  if (!card) return null;

  if (phase === "intro" || phase === "outro") {
    const text = t(`werewolfNarrator.guide.${phase === "intro" ? "wake" : "sleep"}.${card.role}`);
    const hint = t(
      phase === "intro"
        ? "werewolfNarrator.guide.tapToShow"
        : "werewolfNarrator.guide.tapToContinue",
    );
    return (
      <button className="ww-guide ww-guide--tap" onClick={onContinue} type="button">
        <strong className="ww-guide__text">{text}</strong>
        <span className="ww-guide__extra">
          {phase === "outro" && <Summary view={view} />}
          {view.deaths.length > 0 && <DeathDetails deaths={view.deaths} />}
          <small>{hint}</small>
        </span>
      </button>
    );
  }

  const info = actInfo(view, t) ?? dayPrompt(view, t);
  const showPeople =
    selection.ability !== null &&
    (view.targets.length > 0 || selection.picks.length > 0 || view.canChooseNobody);
  const isWitchOrMagician = state.status === "witch" || state.status === "magician";
  const extras = [
    !card.cover && isWitchOrMagician && (
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
    !card.cover && isWitchOrMagician && !selection.heal && selection.picks.length === 0 && (
      <small key="skip">{t("werewolfNarrator.guide.skipHint")}</small>
    ),
    view.notes.restricted && (
      <small key="restricted">
        {t("werewolfNarrator.guide.restricted", { name: view.notes.restricted })}
      </small>
    ),
    (state.status === "day" || state.status === "vote") && <DayNotes key="notes" view={view} />,
  ].filter(Boolean);
  return (
    <section className="ww-guide ww-guide--sheet">
      <header className="ww-guide__head">
        <strong className="ww-guide__text">
          {card.cover
            ? t("werewolfNarrator.guide.coverTitle")
            : (info ??
              (selection.ability
                ? t(
                    `werewolfNarrator.guide.ask.${selection.ability === "inspect" && card.role === "apprenticeSeer" ? "inspectApprentice" : selection.ability}`,
                  )
                : card.abilities.length > 0
                  ? t("werewolfNarrator.guide.pickAbility")
                  : t("werewolfNarrator.guide.confirmDone")))}
        </strong>
        <span className="ww-guide__tools">
          {view.canUndo && (
            <button
              aria-label={t("werewolfNarrator.guide.undo")}
              className="ww-guide__close"
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
      {extras.length > 0 && <footer className="ww-guide__extra">{extras}</footer>}
    </section>
  );
}

/** The result of a step in which the narrator reads something out (what the seer sees, who is in love). */
function actInfo(view: GuideView, t: TFunction): string | null {
  const { state } = view;
  switch (state.status) {
    case "vision":
      return t(
        state.isWolf
          ? "werewolfNarrator.guide.vision.wolf"
          : "werewolfNarrator.guide.vision.village",
        { name: state.target },
      );
    case "investigation":
      return t(
        state.isWolfNearby
          ? "werewolfNarrator.guide.investigation.yes"
          : "werewolfNarrator.guide.investigation.no",
        { name: state.target },
      );
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
    case "amuletPass":
      return t("werewolfNarrator.guide.amuletHolder", { name: state.amulet.holder });
    default:
      return null;
  }
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

/** What the narrator reads or does during the day: nominate (three choices), vote, or end the day. */
function dayPrompt(view: GuideView, t: TFunction): string | null {
  const { selection, state } = view;
  if (state.status === "vote") return t("werewolfNarrator.guide.day.voters");
  if (state.status !== "day") return null;
  if (selection.ability !== "vote") return t("werewolfNarrator.guide.day.idle");
  const [target, nominator, seconder] = selection.picks;
  if (target === undefined) return t("werewolfNarrator.guide.day.nominee");
  if (nominator === undefined) return t("werewolfNarrator.guide.day.nominator");
  if (seconder === undefined) return t("werewolfNarrator.guide.day.seconder");
  return t("werewolfNarrator.guide.day.chosen", { nominator, seconder, target });
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

/** A small mark behind a name in the list of voters: the mayor counts twice, the village idiot has to vote yes. */
function Mark({ view, name }: { readonly view: GuideView; readonly name: string }) {
  const { t } = useTranslation();
  const note = view.voterNotes[name];
  return note ? (
    <small className="ww-person__mark"> {t(`werewolfNarrator.guide.voter.${note}`)}</small>
  ) : null;
}

/** What the narrator chose in this step, so it can be checked before the role falls asleep. */
function Summary({ view }: { readonly view: GuideView }) {
  const { t } = useTranslation();
  const { card, selection } = view;
  if (!card || card.cover || card.abilities.length === 0) return null;
  const parts: string[] = [];
  if (selection.heal) parts.push(t("werewolfNarrator.ability.heal"));
  if (selection.ability && selection.ability !== "heal") {
    const people =
      selection.none || selection.picks.length === 0
        ? t("werewolfNarrator.guide.nobody")
        : selection.picks.join(", ");
    parts.push(`${t(`werewolfNarrator.ability.${selection.ability}`)}: ${people}`);
  }
  return (
    <span className="ww-guide__chosen">
      {parts.length > 0
        ? t("werewolfNarrator.guide.chosen", { items: parts.join(" · ") })
        : t("werewolfNarrator.guide.noChoice")}
    </span>
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

/** What the narrator has to keep in mind during the day: who is silenced, who is wounded. */
function DayNotes({ view }: { readonly view: GuideView }) {
  const { t } = useTranslation();
  const { silenced, wounded } = view.notes;
  if (!silenced && wounded.length === 0) return null;
  return (
    <ul className="ww-guide__notes">
      {silenced && <li>{t("werewolfNarrator.guide.silenced", { name: silenced })}</li>}
      {wounded.length > 0 && (
        <li>{t("werewolfNarrator.guide.wounded", { names: wounded.join(", ") })}</li>
      )}
    </ul>
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

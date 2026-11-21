import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { GuideView } from "../../business/games/werewolf/narratorGuide";
import {
  currentWerewolfRole,
  werewolfAnnouncement,
  werewolfDrunkReveal,
} from "../../business/games/werewolf/stateMachine";
import { Button } from "../components";
import { DealCard } from "./DealCard";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";

interface GuideBoxProps {
  readonly view: GuideView;
  readonly onChoose: (name: string) => void;
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
  onContinue,
  onNobody,
  onUndo,
  onUnchoose,
}: GuideBoxProps) {
  const { t } = useTranslation();
  const { card, phase, selection } = view;

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
        <small>{hint}</small>
      </button>
    );
  }

  const info = actInfo(view, t);
  const showPeople =
    selection.ability !== null &&
    (view.targets.length > 0 || selection.picks.length > 0 || view.canChooseNobody);
  return (
    <section className="ww-guide">
      {card.cover ? (
        <>
          <strong className="ww-guide__text">{t("werewolfNarrator.guide.coverTitle")}</strong>
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
        </>
      ) : (
        <strong className="ww-guide__text">
          {info ??
            (selection.ability
              ? t(`werewolfNarrator.guide.ask.${selection.ability}`)
              : card.abilities.length > 0
                ? t("werewolfNarrator.guide.pickAbility")
                : t("werewolfNarrator.guide.confirmDone"))}
        </strong>
      )}
      {showPeople && (
        <div className="ww-guide__people">
          {selection.picks.map((name) => (
            <button
              aria-pressed="true"
              className="ww-person"
              key={name}
              onClick={() => onUnchoose(name)}
              type="button"
            >
              {name}
            </button>
          ))}
          {view.targets.map((name) => (
            <button className="ww-person" key={name} onClick={() => onChoose(name)} type="button">
              {name}
            </button>
          ))}
          {view.canChooseNobody && (
            <button
              aria-pressed={selection.none}
              className="ww-person ww-person--nobody"
              onClick={onNobody}
              type="button"
            >
              {t("werewolfNarrator.guide.nobody")}
            </button>
          )}
        </div>
      )}
      {view.canUndo && (
        <Button className="ww-guide__undo" onClick={onUndo} variant="secondary">
          {t("werewolfNarrator.guide.undo")}
        </Button>
      )}
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
    case "amuletIntro":
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
        role={dealt.role}
      />
    );
  }
  if (state.status === "morning") {
    const names = werewolfAnnouncement(state).map((entry) => entry.name);
    return (
      <section className="ww-guide">
        <strong className="ww-guide__text">{t("werewolfNarrator.guide.morning.title")}</strong>
        <span>
          {names.length === 0
            ? t("werewolfNarrator.guide.morning.nobody")
            : t("werewolfNarrator.guide.morning.died", { names: names.join(", ") })}
        </span>
      </section>
    );
  }
  return (
    <section className="ww-guide">
      <strong className="ww-guide__text">{t("werewolfNarrator.guide.day.title")}</strong>
      <span>{t("werewolfNarrator.guide.day.hint")}</span>
    </section>
  );
}

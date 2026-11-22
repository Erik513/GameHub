import { useTranslation } from "react-i18next";
import type {
  CardAbilityId,
  NarratorCard as Card,
} from "../../business/games/werewolf/narratorCard";
import type { SymbolId } from "./symbols/catalog";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";

interface NarratorCardProps {
  readonly card: Card;
  /** The ability the narrator has opened (its content is in the lower box). */
  /** The abilities the narrator has chosen (the open one, the healing switch). */
  readonly pressed?: readonly CardAbilityId[];
  /** The step is done: the buttons no longer invite a tap and only show what was chosen. */
  readonly settled?: boolean;
  /** The narrator has decided: no ability can be tapped any more (the way back opens the decision again). */
  readonly locked?: boolean;
  /** The abilities are the next thing to tap: the ones that can be used get a blue frame. */
  readonly next?: boolean;
  /** The role may do nothing: a button "skip" stands next to the abilities (the narrator decides in this box). */
  readonly skip?:
    | {
        readonly disabled: boolean;
        readonly framed: boolean;
        /** The text of the button when it is not "skip" (the holder of the amulet keeps it). */
        readonly label?: string;
        readonly onSkip: () => void;
      }
    | undefined;
  /** Called when the narrator taps an ability that can be used. */
  readonly onAbility?: (id: CardAbilityId) => void;
}

const slotCount = 3;

/**
 * The upper box of the narrator view: who is awake (role symbol, name), the effects from outside on them (three
 * slots) and, at the bottom, the abilities of the role as large buttons: green when the narrator can use one now,
 * red when it is used up or not possible.
 */
export function NarratorCard({
  card,
  pressed = [],
  settled = false,
  locked = false,
  next = false,
  onAbility,
  skip,
}: NarratorCardProps) {
  const { t } = useTranslation();
  // The amulet is no role: its holder is shown with his own role.
  const shownRole = (card.holderRole ?? card.role) as SymbolId;
  const roleName = t(`werewolfSymbols.items.${shownRole}.name`);
  const slots = Array.from({ length: slotCount }, (_, index) => card.effects[index] ?? null);
  return (
    <section aria-label={roleName} className="ww-role-card" data-cover={card.cover}>
      <header className="ww-role-card__head">
        <span className="ww-role-card__role">
          <WerewolfSymbol id={shownRole} size={40} />
        </span>
        <span className="ww-role-card__who">
          <strong>{roleName}</strong>
          {card.actors.length > 0 && <small>{card.actors.join(", ")}</small>}
        </span>
        <ul aria-label={t("werewolfNarrator.card.effects")} className="ww-role-card__slots">
          {slots.map((effect, index) => (
            <li className="ww-role-card__slot" data-empty={effect === null} key={index}>
              {effect && (
                <WerewolfSymbol
                  id={effect}
                  label={t(`werewolfSymbols.items.${effect}.name`)}
                  size={22}
                />
              )}
            </li>
          ))}
        </ul>
      </header>
      {card.abilities.length > 0 && (
        <div className="ww-role-card__abilities">
          {card.abilities.map((ability) => {
            const name = t(`werewolfNarrator.ability.${ability.id}`);
            return (
              <button
                aria-label={`${name}: ${t(
                  ability.available
                    ? "werewolfNarrator.card.ready"
                    : "werewolfNarrator.card.unavailable",
                )}`}
                aria-pressed={pressed.includes(ability.id)}
                className="ww-ability"
                data-available={ability.available}
                data-state={ability.available ? "ready" : (ability.unavailable ?? "blocked")}
                data-next={(next && ability.available && !settled) || undefined}
                data-settled={settled || undefined}
                disabled={!ability.available || locked}
                key={ability.id}
                onClick={() => onAbility?.(ability.id)}
                type="button"
              >
                <span className="ww-ability__symbol">
                  <WerewolfSymbol id={ability.symbol} size={24} />
                </span>
                <span>{name}</span>
              </button>
            );
          })}
          {skip && (
            <button
              className="ww-ability ww-ability--skip"
              data-next={skip.framed || undefined}
              disabled={skip.disabled}
              onClick={skip.onSkip}
              type="button"
            >
              {skip.label ?? t("werewolfNarrator.guide.skip")}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

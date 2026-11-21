import { useTranslation } from "react-i18next";
import type {
  CardAbilityId,
  NarratorCard as Card,
} from "../../business/games/werewolf/narratorCard";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";

interface NarratorCardProps {
  readonly card: Card;
  /** The ability the narrator has opened (its content is in the lower box). */
  readonly active?: CardAbilityId | null;
  /** Called when the narrator taps an ability that can be used. */
  readonly onAbility?: (id: CardAbilityId) => void;
}

const slotCount = 3;

/**
 * The upper box of the narrator view: who is awake (role symbol, name), the effects from outside on them (three
 * slots) and, at the bottom, the abilities of the role as large buttons: green when the narrator can use one now,
 * red when it is used up or not possible.
 */
export function NarratorCard({ card, active = null, onAbility }: NarratorCardProps) {
  const { t } = useTranslation();
  const roleName = t(`werewolfSymbols.items.${card.role}.name`);
  const slots = Array.from({ length: slotCount }, (_, index) => card.effects[index] ?? null);
  return (
    <section aria-label={roleName} className="ww-card" data-cover={card.cover}>
      <header className="ww-card__head">
        <span className="ww-card__role">
          <WerewolfSymbol id={card.role} size={40} />
        </span>
        <span className="ww-card__who">
          <strong>{roleName}</strong>
          {card.actors.length > 0 && <small>{card.actors.join(", ")}</small>}
        </span>
        <ul aria-label={t("werewolfNarrator.card.effects")} className="ww-card__slots">
          {slots.map((effect, index) => (
            <li className="ww-card__slot" data-empty={effect === null} key={index}>
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
        <div className="ww-card__abilities">
          {card.abilities.map((ability) => {
            const name = t(`werewolfNarrator.ability.${ability.id}`);
            return (
              <button
                aria-label={`${name}: ${t(
                  ability.available
                    ? "werewolfNarrator.card.ready"
                    : "werewolfNarrator.card.unavailable",
                )}`}
                aria-pressed={active === ability.id}
                className="ww-ability"
                data-available={ability.available}
                disabled={!ability.available}
                key={ability.id}
                onClick={() => onAbility?.(ability.id)}
                type="button"
              >
                <span className="ww-ability__symbol">
                  <WerewolfSymbol id={ability.symbol} size={32} />
                  {ability.count !== undefined && (
                    <span className="ww-ability__count">{ability.count}</span>
                  )}
                </span>
                <span>{name}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

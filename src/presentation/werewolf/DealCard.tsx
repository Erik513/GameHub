import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RoleCardInfo } from "./RoleCardInfo";
import { abilitiesOfRole, type DealtRole, type RoleVariant } from "./roleAbilities";
import { WerewolfSymbol } from "./symbols/WerewolfSymbol";

interface DealCardProps {
  /** The player who looks at the card now. */
  readonly name: string;
  /** What the player sees: the drunk sees the drunk, never the real role. */
  readonly role: DealtRole;
  /** The player holds the protective amulet. */
  readonly amulet: boolean;
  readonly mayor: "doubleVote" | "hammer";
  /** Which player this is of how many (1 based), shown on the covered card. */
  readonly position: number;
  /** The option the role is played with in this game (for example with the duty to shoot), if it has one. */
  readonly variant: RoleVariant | null;
  readonly total: number;
}

/**
 * The card of the role reveal. The first view names the player and says what to do; a tap shows the role (symbol,
 * name, abilities, an "i" that explains the role) and a second tap covers it again, so the device can be passed on.
 * The card is covered whenever the app goes to the background.
 */
export function DealCard({ name, role, amulet, mayor, position, total, variant }: DealCardProps) {
  const { t } = useTranslation();
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const cover = () => {
      if (document.hidden) setShown(false);
    };
    document.addEventListener("visibilitychange", cover);
    return () => document.removeEventListener("visibilitychange", cover);
  }, []);
  const roleName = t(`werewolfSymbols.items.${role}.name`);
  const abilities = abilitiesOfRole(role, mayor);
  return (
    <section aria-label={name} className="ww-deal" data-shown={shown}>
      <button
        aria-pressed={shown}
        className="ww-deal__face"
        onClick={() => setShown((current) => !current)}
        type="button"
      >
        <span className="ww-deal__body">
          {shown ? (
            <>
              <span className="ww-deal__who">
                <span className="ww-deal__role">
                  <WerewolfSymbol id={role} size={88} />
                </span>
                <strong className="ww-deal__name">{roleName}</strong>
                {/* The place under the name is kept free on every card, so the layout is the same for all roles. */}
                <span className="ww-deal__variant-slot">
                  {variant && (
                    <span className="ww-deal__variant">
                      {t(`werewolfConfig.variants.${variant}`)}
                    </span>
                  )}
                </span>
              </span>
              <span className="ww-deal__zone">
                <span className="ww-deal__abilities">
                  {abilities.length === 0 ? (
                    <small>{t("werewolfNarrator.deal.noAbility")}</small>
                  ) : (
                    abilities.map((entry) => (
                      <span className="ww-deal__ability" key={entry.symbol}>
                        <WerewolfSymbol id={entry.symbol} size={44} />
                        <small>
                          {entry.ability
                            ? t(`werewolfNarrator.ability.${entry.ability}`)
                            : t(`werewolfSymbols.items.${entry.symbol}.name`)}
                        </small>
                      </span>
                    ))
                  )}
                </span>
                {amulet && (
                  <span className="ww-deal__amulet">
                    <WerewolfSymbol id="amulet" size={24} />
                    <strong>{t("werewolfNarrator.deal.amulet")}</strong>
                  </span>
                )}
              </span>
            </>
          ) : (
            <>
              <strong className="ww-deal__name">{name}</strong>
              <span>{t("werewolfNarrator.deal.hint")}</span>
            </>
          )}
        </span>
        <small className="ww-deal__tap">
          {t(shown ? "werewolfNarrator.deal.hide" : "werewolfNarrator.deal.show")}
        </small>
      </button>
      {!shown && (
        <small className="ww-deal__count">
          {t("werewolfNarrator.deal.count", { current: position, total })}
        </small>
      )}
      {shown && (
        <RoleCardInfo amulet={amulet} className="ww-deal__info" role={role} variant={variant} />
      )}
    </section>
  );
}

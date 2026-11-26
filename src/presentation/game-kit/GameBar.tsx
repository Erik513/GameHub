import type { ComponentProps, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "../components";
import { EndGameButton } from "./EndGameButton";

interface GameBarProps {
  /** Where the game stands, at the left (the night, the round …). */
  readonly status: ReactNode;
  /** The symbol in front of the status. */
  readonly icon?: ComponentProps<typeof Icon>["name"];
  /** What a screen reader says about the status, when the status itself is not enough. */
  readonly statusLabel?: string;
  /** A look of the status that the game styles itself (for example the day of Werewolf). */
  readonly tone?: string;
  /** Opens the rules; without it there is no rules button (for example while the roles are dealt). */
  readonly onRules?: () => void;
  /** The game's own buttons, between the rules and "End game" (the overview, the pause …). */
  readonly children?: ReactNode;
  /** Ends the game (after the second tap); without it there is no button (the game ends another way). */
  readonly onEnd?: () => void;
}

/**
 * The bar of a running game, the same in every game: the status at the left, then the symbol of the rules, the game's
 * own buttons and "End game" at the right. While a game runs it takes the place of the header of the app.
 */
export function GameBar({
  status,
  icon,
  statusLabel,
  tone,
  onRules,
  children,
  onEnd,
}: GameBarProps) {
  const { t } = useTranslation();
  return (
    <header className="kit-game-bar">
      <span
        className="kit-game-bar__status"
        {...(tone === undefined ? {} : { "data-tone": tone })}
        {...(statusLabel === undefined ? {} : { "aria-label": statusLabel, role: "img" })}
      >
        {icon && <Icon name={icon} />}
        <strong>{status}</strong>
      </span>
      {onRules && (
        <Button
          aria-label={t("kitSetup.rulesButton")}
          onClick={onRules}
          title={t("kitSetup.rulesButton")}
          variant="secondary"
        >
          <Icon name="book" />
        </Button>
      )}
      {children}
      {onEnd && <EndGameButton compact onConfirm={onEnd} />}
    </header>
  );
}

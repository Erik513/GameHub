import { useTranslation } from "react-i18next";
import { ConfirmButton, Icon } from "../components";

interface EndGameButtonProps {
  readonly onConfirm: () => void;
  /** Only the X (in a bar or the header); without it the button shows the words "End game". */
  readonly compact?: boolean;
  readonly className?: string;
}

/**
 * The button that ends a running game, the same in every game: red from the start, the first tap only asks ("End?",
 * with the X when it is compact), a second tap within a few seconds ends the game. No window; screen readers hear
 * "Tap again to end". It leads back to the main menu of the game.
 */
export function EndGameButton({ onConfirm, compact = false, className }: EndGameButtonProps) {
  const { t } = useTranslation();
  return (
    <ConfirmButton
      armedContent={
        compact ? (
          <>
            <Icon name="close" />
            <span>{t("navigation.exitGameAsk")}</span>
          </>
        ) : (
          t("navigation.exitGameAsk")
        )
      }
      armedLabel={t("navigation.exitGameConfirm")}
      {...(className === undefined ? {} : { className })}
      idleLabel={t("navigation.exitGame")}
      idleVariant="danger"
      onConfirm={onConfirm}
    >
      {compact ? <Icon name="close" /> : t("navigation.exitGame")}
    </ConfirmButton>
  );
}

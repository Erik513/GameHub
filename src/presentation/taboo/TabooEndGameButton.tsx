import { useTranslation } from "react-i18next";
import { ConfirmButton } from "../components";

/**
 * The button on the pause card that gives the game up. It needs a second tap because the game and
 * its result are lost; it leads back to the main menu with the setup still filled in.
 */
export function TabooEndGameButton({ onConfirm }: { readonly onConfirm: () => void }) {
  const { t } = useTranslation();
  return (
    <ConfirmButton
      armedLabel={t("navigation.exitGameConfirm")}
      idleLabel={t("navigation.exitGame")}
      onConfirm={onConfirm}
    >
      {t("navigation.exitGame")}
    </ConfirmButton>
  );
}

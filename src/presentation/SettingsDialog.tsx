import { useTranslation } from "react-i18next";
import type { SupportedLanguage } from "../i18n";
import { Dialog } from "./components";

interface SettingsDialogProps {
  cardLanguage: SupportedLanguage;
  onCardLanguageChange: (language: SupportedLanguage) => void;
  onClose: () => void;
  onLanguageChange: (language: SupportedLanguage) => void;
  open: boolean;
}

export function SettingsDialog({
  cardLanguage,
  onCardLanguageChange,
  onClose,
  onLanguageChange,
  open,
}: SettingsDialogProps) {
  const { t, i18n } = useTranslation();
  const selectedLanguage: SupportedLanguage = i18n.resolvedLanguage === "de" ? "de" : "en";

  async function handleLanguageChange(language: SupportedLanguage) {
    await i18n.changeLanguage(language);
    onLanguageChange(language);
  }

  return (
    <Dialog
      closeLabel={t("settings.close")}
      description={t("settings.description")}
      onClose={onClose}
      open={open}
      title={t("settings.title")}
    >
      <div className="settings-fields">
        <label className="language-control">
          <span>{t("language.uiLabel")}</span>
          <select
            value={selectedLanguage}
            onChange={(event) =>
              void handleLanguageChange(event.currentTarget.value as SupportedLanguage)
            }
          >
            <option value="de">{t("language.options.de")}</option>
            <option value="en">{t("language.options.en")}</option>
          </select>
        </label>
        <label className="language-control">
          <span>{t("language.cardLabel")}</span>
          <select
            value={cardLanguage}
            onChange={(event) =>
              onCardLanguageChange(event.currentTarget.value as SupportedLanguage)
            }
          >
            <option value="de">{t("language.options.de")}</option>
            <option value="en">{t("language.options.en")}</option>
          </select>
        </label>
      </div>
    </Dialog>
  );
}

import { useTranslation } from "react-i18next";
import type { SupportedLanguage } from "../i18n";
import { Dialog } from "./components";
import { ChoiceGroup } from "./game-kit";

interface SettingsDialogProps {
  onClose: () => void;
  onLanguageChange: (language: SupportedLanguage) => void;
  open: boolean;
}

const toLanguage = (value: string): SupportedLanguage => (value === "de" ? "de" : "en");

export function SettingsDialog({ onClose, onLanguageChange, open }: SettingsDialogProps) {
  const { t, i18n } = useTranslation();
  const selectedLanguage: SupportedLanguage = i18n.resolvedLanguage === "de" ? "de" : "en";
  // English is the default language of the app, so it comes first.
  const languageOptions = [
    { value: "en", label: t("language.options.en") },
    { value: "de", label: t("language.options.de") },
  ];

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
        <ChoiceGroup
          initial={selectedLanguage}
          legend={t("language.uiLabel")}
          name="uiLanguage"
          onChange={(language) => void handleLanguageChange(toLanguage(language))}
          options={languageOptions}
          value={selectedLanguage}
        />
      </div>
    </Dialog>
  );
}

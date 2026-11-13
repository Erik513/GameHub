import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Dialog } from "../components";

const sections = ["goal", "turn", "scoring", "end", "race"] as const;

/** A button that opens the rules of Taboo in a dialog. */
export function TabooRules() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="taboo-rules-button" variant="secondary" onClick={() => setOpen(true)}>
        <svg aria-hidden="true" focusable="false" height="18" viewBox="0 0 24 24" width="18">
          <path
            d="M12 6.5C10.5 5.4 8.3 5 5 5v12.5c3.3 0 5.5.4 7 1.5 1.5-1.1 3.7-1.5 7-1.5V5c-3.3 0-5.5.4-7 1.5ZM12 6.5V19"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
        {t("tabooRules.open")}
      </Button>
      <Dialog
        closeLabel={t("settings.close")}
        onClose={() => setOpen(false)}
        open={open}
        title={t("tabooRules.title")}
      >
        <ul className="taboo-rules-list">
          {sections.map((key) => (
            <li key={key}>{t(`tabooRules.${key}`)}</li>
          ))}
        </ul>
      </Dialog>
    </>
  );
}

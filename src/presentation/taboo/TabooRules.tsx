import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Dialog } from "../components";

const sections = ["goal", "turn", "scoring", "skips", "end"] as const;

/** A button that opens the rules of Taboo in a dialog. */
export function TabooRules() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="taboo-rules-button" variant="quiet" onClick={() => setOpen(true)}>
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

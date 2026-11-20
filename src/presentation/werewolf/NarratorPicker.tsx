import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Dialog } from "../components";

interface NarratorPickerProps {
  readonly narrator: string | null;
  readonly onChoose: (name: string | null) => void;
  readonly participants: readonly string[];
}

/**
 * The narrator: the box shows who it is, a button opens a window with all participants to choose from
 * (and, when somebody is chosen, a button for nobody). The narrator leaves the seats; the narrator of
 * before sits down behind the last player (the line-up does that).
 */
export function NarratorPicker({ narrator, onChoose, participants }: NarratorPickerProps) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const sorted = [...participants].sort(new Intl.Collator(i18n.language).compare);

  function choose(name: string | null) {
    onChoose(name);
    setOpen(false);
  }

  return (
    <div className="ww-narrator">
      <div className="ww-narrator__box">
        <span className="ww-narrator__label">{t("werewolfLineup.narratorLabel")}</span>
        <span className="ww-narrator__name" data-empty={narrator === null || undefined}>
          {narrator ?? t("werewolfLineup.narratorNotChosen")}
        </span>
      </div>
      <Button
        className="ww-narrator__button"
        disabled={participants.length === 0}
        onClick={() => setOpen(true)}
        variant="primary"
      >
        {t(narrator === null ? "werewolfLineup.narratorChoose" : "werewolfLineup.narratorChange")}
      </Button>
      <Dialog
        closeLabel={t("settings.close")}
        description={t("werewolfLineup.narratorHint")}
        onClose={() => setOpen(false)}
        open={open}
        title={t("werewolfLineup.narratorTitle")}
      >
        <ul className="ww-choices">
          {sorted.map((name) => (
            <li key={name}>
              <Button
                aria-pressed={name === narrator}
                className="ww-choices__button"
                onClick={() => choose(name)}
                variant={name === narrator ? "success" : "secondary"}
              >
                {name}
              </Button>
            </li>
          ))}
        </ul>
        {narrator !== null && (
          <Button onClick={() => choose(null)} variant="danger">
            {t("werewolfLineup.narratorNone")}
          </Button>
        )}
      </Dialog>
    </div>
  );
}

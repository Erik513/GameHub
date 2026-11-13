import { useRef, type KeyboardEvent } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button, Dialog } from "../components";
import { tabooModes, type TabooMode } from "./tabooSetupModel";

/** The button that opens the rules window. */
export function TabooRulesButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();

  return (
    <Button className="taboo-rules-button" variant="secondary" onClick={onClick}>
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
  );
}

interface TabooRulesDialogProps {
  onClose: () => void;
  /** Closes the window and shows the tiebreak window instead. */
  onOpenTiebreak: () => void;
  /** Shows the rules of another game mode; this does not change the chosen game mode. */
  onTabChange: (mode: TabooMode) => void;
  open: boolean;
  /** The game mode whose rules are shown. */
  tab: TabooMode;
}

/**
 * One window with the rules of the game: what is the same in every game mode, then the game modes
 * side by side as tabs with the rules of the selected one below.
 */
export function TabooRulesDialog({
  onClose,
  onOpenTiebreak,
  onTabChange,
  open,
  tab,
}: TabooRulesDialogProps) {
  const { t } = useTranslation();
  const tabRefs = useRef<Partial<Record<TabooMode, HTMLButtonElement | null>>>({});

  function move(event: KeyboardEvent, mode: TabooMode) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const index = tabooModes.indexOf(mode);
    const next = tabooModes[(index + step + tabooModes.length) % tabooModes.length];
    if (!next) return;
    onTabChange(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <Dialog
      closeLabel={t("settings.close")}
      onClose={onClose}
      open={open}
      title={t("tabooRules.title")}
    >
      <ul className="taboo-rules-list">
        <li>{t("tabooRules.goal")}</li>
        <li>{t("tabooRules.turn")}</li>
      </ul>
      <div aria-label={t("tabooMode.legend")} className="taboo-rules-tabs" role="tablist">
        {tabooModes.map((mode) => (
          <button
            aria-controls={`taboo-rules-panel-${mode}`}
            aria-selected={mode === tab}
            className="taboo-rules-tab"
            id={`taboo-rules-tab-${mode}`}
            key={mode}
            ref={(element) => {
              tabRefs.current[mode] = element;
            }}
            role="tab"
            tabIndex={mode === tab ? 0 : -1}
            type="button"
            onClick={() => onTabChange(mode)}
            onKeyDown={(event) => move(event, mode)}
          >
            {t(`tabooMode.${mode}`)}
          </button>
        ))}
      </div>
      {/* All game modes stay in the layout on top of each other and only the chosen one is shown,
          so the window has the height of the longest rules and the buttons never move. */}
      <div className="taboo-rules-panels">
        {tabooModes.map((mode) => (
          <div
            aria-hidden={mode !== tab}
            aria-labelledby={`taboo-rules-tab-${mode}`}
            id={`taboo-rules-panel-${mode}`}
            key={mode}
            role="tabpanel"
            style={mode === tab ? undefined : { visibility: "hidden" }}
          >
            <ul className="taboo-rules-list">
              {t(`tabooMode.${mode}Rules`)
                .split("\n")
                .map((line) => (
                  <li key={line}>{line}</li>
                ))}
              {mode === "classic" && (
                <li>
                  <Trans
                    components={{
                      ref: (
                        <button className="kit-link-button" type="button" onClick={onOpenTiebreak}>
                          {t("tabooTiebreakInfo.title")}
                        </button>
                      ),
                    }}
                    i18nKey="tabooMode.tiebreakRule"
                  />
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </Dialog>
  );
}

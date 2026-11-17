import { useTranslation } from "react-i18next";
import type { ValidationIssue } from "../../business/games/taboo/model";
import { tabooLineup } from "../../business/games/taboo/lineup";
import type { LineupIssue } from "../../business/shared/lineup";
import type { TeamSetupValue } from "../../business/shared/teamSetup";
import { Button, Icon, Toast } from "../components";
import { LineupScreen, LineupSetup } from "../game-kit";
import { TabooSetupMessages } from "./TabooSetupMessages";
import type { CardShortage } from "./tabooStartPlan";
import type { FormEventHandler } from "react";

interface TabooLineupProps {
  /** Counts the start attempts (see `TabooSetupMessages`). */
  readonly attempt: number;
  readonly deckEmpty: boolean;
  /** True while the cards are being prepared; the start button then waits. */
  readonly generating: boolean;
  readonly issues: readonly ValidationIssue[];
  /** The latest problem of the line-up itself (too few players and so on), shown as a message. */
  readonly lineupNotice: { readonly id: number; readonly value: LineupIssue } | undefined;
  /** The line-up was changed. */
  readonly onChange: (value: TeamSetupValue) => void;
  readonly onOpenSettings: () => void;
  readonly onSubmit: FormEventHandler<HTMLFormElement>;
  readonly shortage: CardShortage | undefined;
  readonly value: TeamSetupValue;
}

/**
 * The first view of Taboo: the line-up (teams, and players when the game uses them) with the start
 * button, and next to it the button to the settings. Messages about the start stand above it.
 */
export function TabooLineup({
  attempt,
  deckEmpty,
  generating,
  issues,
  lineupNotice,
  onChange,
  onOpenSettings,
  onSubmit,
  shortage,
  value,
}: TabooLineupProps) {
  const { t } = useTranslation();
  return (
    <LineupScreen
      ariaLabel={t("tabooLineup.label")}
      formId="taboo-lineup-form"
      sideAction={
        <Button
          aria-label={t("kitSetup.tabSettings")}
          className="kit-lineup__settings"
          onClick={onOpenSettings}
          title={t("kitSetup.tabSettings")}
          variant="secondary"
        >
          <Icon name="sliders" />
        </Button>
      }
      messages={
        <>
          <TabooSetupMessages
            attempt={attempt}
            deckEmpty={deckEmpty}
            issues={issues}
            shortage={shortage}
          />
          {lineupNotice && (
            <Toast key={lineupNotice.id} tone="error">
              {t(`kitLineup.${lineupNotice.value.code}`, { count: lineupNotice.value.count })}
            </Toast>
          )}
        </>
      }
      onSubmit={onSubmit}
      startDisabled={generating}
      startLabel={t(generating ? "tabooSetup.preparingCards" : "tabooLineup.start")}
    >
      <LineupSetup config={tabooLineup} onChange={onChange} value={value} />
    </LineupScreen>
  );
}

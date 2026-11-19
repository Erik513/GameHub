import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  moveSeat,
  werewolfLineupIssues,
  type WerewolfLineup as Lineup,
} from "../../business/games/werewolf/lineup";
import { Button, Icon, Toast } from "../components";
import { LineupScreen, SetupTabs } from "../game-kit";
import { PlayersTab } from "./PlayersTab";
import { SeatsTab } from "./SeatsTab";

interface WerewolfLineupProps {
  readonly lineup: Lineup;
  readonly onChange: (lineup: Lineup) => void;
  readonly onOpenConfiguration: () => void;
}

/**
 * The first view of Werewolf: who takes part, who narrates, and where everybody sits. Two tabs ("Players"
 * and "Seats") and the start button at the bottom. The start can always be pressed; when something is missing (players,
 * a narrator, six to twenty players besides the narrator) a notification above the bar says what.
 */
export function WerewolfLineup({ lineup, onChange, onOpenConfiguration }: WerewolfLineupProps) {
  const { t } = useTranslation();
  const [notice, setNotice] = useState<{ readonly id: number; readonly text: string }>();
  const issues = werewolfLineupIssues(lineup);
  const first = issues[0];
  const problem = lineup.participants.length === 0 || first !== undefined;

  const issueText = (issue: NonNullable<typeof first>) =>
    t(`werewolfLineup.${issue.code}`, issue.code === "noNarrator" ? {} : issue);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text =
      lineup.participants.length === 0
        ? t("werewolfLineup.noPlayers")
        : first
          ? issueText(first)
          : t("werewolfLineup.startSoon");
    setNotice((current) => ({ id: (current?.id ?? 0) + 1, text }));
  }

  return (
    <LineupScreen
      ariaLabel={t("werewolfLineup.label")}
      formId="werewolf-lineup-form"
      messages={
        notice && (
          <Toast key={notice.id} tone={problem ? "error" : "info"}>
            {notice.text}
          </Toast>
        )
      }
      onSubmit={submit}
      sideAction={
        <Button
          aria-label={t("werewolfConfig.open")}
          className="kit-lineup__settings"
          onClick={onOpenConfiguration}
          title={t("werewolfConfig.open")}
          variant="secondary"
        >
          <Icon name="sliders" />
        </Button>
      }
      startLabel={t("werewolfLineup.start")}
    >
      <SetupTabs
        ariaLabel={t("werewolfLineup.label")}
        tabs={[
          {
            content: <PlayersTab lineup={lineup} onChange={onChange} />,
            id: "players",
            label: t("werewolfLineup.playersTab", { count: lineup.participants.length }),
          },
          {
            content: (
              <SeatsTab
                lineup={lineup}
                onMove={(name, toIndex) => onChange(moveSeat(lineup, name, toIndex))}
              />
            ),
            id: "seats",
            label: t("werewolfLineup.seatsTab"),
          },
        ]}
      />
    </LineupScreen>
  );
}

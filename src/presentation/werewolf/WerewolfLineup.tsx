import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  moveSeat,
  werewolfLineupIssues,
  type WerewolfLineup as Lineup,
} from "../../business/games/werewolf/lineup";
import { Toast } from "../components";
import { LineupScreen, SetupTabs } from "../game-kit";
import { PlayersTab } from "./PlayersTab";
import { SeatsTab } from "./SeatsTab";

interface WerewolfLineupProps {
  readonly lineup: Lineup;
  readonly onChange: (lineup: Lineup) => void;
}

/**
 * The first view of Werewolf: who takes part, who narrates, and where everybody sits. Two tabs ("Players"
 * and "Seats") and the start button at the bottom. The start is blocked until a narrator is chosen; it
 * then asks for six to twenty players besides the narrator.
 */
export function WerewolfLineup({ lineup, onChange }: WerewolfLineupProps) {
  const { t } = useTranslation();
  const [notice, setNotice] = useState<{ readonly id: number; readonly text: string }>();
  const issues = werewolfLineupIssues(lineup);
  const first = issues[0];

  const issueText = (issue: NonNullable<typeof first>) =>
    t(`werewolfLineup.${issue.code}`, issue.code === "noNarrator" ? {} : issue);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = first ? issueText(first) : t("werewolfLineup.startSoon");
    setNotice((current) => ({ id: (current?.id ?? 0) + 1, text }));
  }

  return (
    <LineupScreen
      ariaLabel={t("werewolfLineup.label")}
      formId="werewolf-lineup-form"
      messages={
        notice && (
          <Toast key={notice.id} tone={first ? "error" : "info"}>
            {notice.text}
          </Toast>
        )
      }
      onSubmit={submit}
      startDisabled={lineup.narrator === null}
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

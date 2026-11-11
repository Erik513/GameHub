import { useState } from "react";
import { useTranslation } from "react-i18next";
import { parsePlayers, splitIntoTeams } from "../../business/shared/players";
import { Button } from "../components";

interface TabooPlayersProps {
  teamCount: number;
}

/** Optional player list: add names, then draw the teams at random or assign players by hand. */
export function TabooPlayers({ teamCount }: TabooPlayersProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [assignment, setAssignment] = useState<Record<string, number>>({});
  const players = parsePlayers(text);
  const teamOf = (player: string) => {
    const index = assignment[player];
    return index !== undefined && index < teamCount ? index : undefined;
  };

  function draw() {
    const next: Record<string, number> = {};
    splitIntoTeams(players, teamCount).forEach((team, index) => {
      for (const player of team) next[player] = index;
    });
    setAssignment(next);
  }

  function assign(player: string, value: string) {
    setAssignment((current) => {
      const next = { ...current };
      if (value === "") delete next[player];
      else next[player] = Number(value);
      return next;
    });
  }

  return (
    <details className="taboo-more taboo-players">
      <summary>{t("tabooPlayers.title")}</summary>
      <p className="taboo-players__hint">{t("tabooPlayers.hint")}</p>
      <textarea
        aria-label={t("tabooPlayers.label")}
        className="field__input taboo-players__input"
        onChange={(event) => setText(event.target.value)}
        placeholder={t("tabooPlayers.placeholder")}
        rows={4}
        value={text}
      />
      {players.length > 0 && (
        <>
          <Button disabled={players.length < 2} onClick={draw} variant="secondary">
            {t("tabooPlayers.draw")}
          </Button>
          <ul aria-label={t("tabooPlayers.assignment")} className="taboo-players__list">
            {players.map((player) => (
              <li key={player}>
                <span>{player}</span>
                <select
                  aria-label={t("tabooPlayers.teamOf", { player })}
                  className="field__input"
                  onChange={(event) => assign(player, event.target.value)}
                  value={teamOf(player)?.toString() ?? ""}
                >
                  <option value="">{t("tabooPlayers.unassigned")}</option>
                  {Array.from({ length: teamCount }, (_, index) => (
                    <option key={index} value={index}>
                      {t("tabooSetup.team", { number: index + 1 })}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
          <ul aria-label={t("tabooPlayers.teams")} className="taboo-players__teams">
            {Array.from({ length: teamCount }, (_, index) => {
              const members = players.filter((player) => teamOf(player) === index);
              return (
                <li key={index}>
                  <strong>{t("tabooSetup.team", { number: index + 1 })}:</strong>{" "}
                  {members.length > 0 ? members.join(", ") : t("tabooPlayers.nobody")}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </details>
  );
}

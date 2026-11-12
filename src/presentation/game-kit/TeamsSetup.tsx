import { useId } from "react";
import { useTranslation } from "react-i18next";
import { parsePlayers, splitIntoTeams } from "../../business/shared/players";
import { sameTeamSetup } from "../../business/shared/savedTeamSetup";
import {
  clampTeamCount,
  defaultTeamRules,
  type TeamOrderMode,
  type TeamRules,
  type TeamSetupValue,
} from "../../business/shared/teamSetup";
import { Button } from "../components";
import { ChoiceGroup } from "./ChoiceGroup";
import { PlayerListField } from "./PlayerListField";
import { RosterPicker } from "./RosterPicker";
import { useTeamSetupMemory } from "./TeamSetupMemoryContext";

interface TeamsSetupProps {
  readonly onChange: (value: TeamSetupValue) => void;
  /** Off hides the player list, optional shows it, required also asks for a player in every team. */
  readonly players?: "off" | "optional" | "required";
  /** Opens the player list from the start, for example on the line-up screen. */
  readonly playersOpen?: boolean;
  readonly rules?: TeamRules;
  readonly value: TeamSetupValue;
}

/**
 * Teams of a game: how many, their names and order, and optionally the players with their
 * assignment to the teams. The value is controlled, the game reads the result with `buildTeams`.
 */
export function TeamsSetup({
  onChange,
  players = "optional",
  playersOpen = false,
  rules = defaultTeamRules,
  value,
}: TeamsSetupProps) {
  const { t } = useTranslation();
  const count = clampTeamCount(value.count, rules);
  const counts = Array.from(
    { length: rules.maxTeams - rules.minTeams + 1 },
    (_, index) => rules.minTeams + index,
  );
  const update = (patch: Partial<TeamSetupValue>) => onChange({ ...value, ...patch });
  // The last group of any game can be taken over; the button only shows when it would change something.
  const remembered = useTeamSetupMemory()?.read();
  // The remembered group is fitted to the limits of this game before it is compared or taken over.
  const saved = remembered && { ...remembered, count: clampTeamCount(remembered.count, rules) };
  const showLoad = saved !== undefined && !sameTeamSetup(saved, value);

  return (
    <>
      {showLoad && (
        <Button onClick={() => onChange(saved)} variant="secondary">
          {t("kitTeams.loadLast")}
        </Button>
      )}
      <ChoiceGroup
        initial={String(count)}
        legend={t("kitTeams.legend")}
        name="teamCount"
        onChange={(next) => update({ count: Number(next) })}
        options={counts.map((number) => ({ value: String(number), label: String(number) }))}
        value={String(count)}
      />
      <div className="kit-team-names">
        {Array.from({ length: count }, (_, index) => (
          <input
            aria-label={t("kitTeams.nameLabel", { number: index + 1 })}
            autoComplete="off"
            className="field__input"
            key={index}
            maxLength={rules.maxNameLength}
            onChange={(event) => {
              const names = Array.from({ length: count }, (_, at) => value.names[at] ?? "");
              names[index] = event.target.value;
              update({ names });
            }}
            placeholder={t("kitTeams.defaultName", { number: index + 1 })}
            value={value.names[index] ?? ""}
          />
        ))}
      </div>
      <ChoiceGroup
        info={{
          closeLabel: t("settings.close"),
          label: t("kitSetup.infoLabel", { setting: t("kitTeams.orderLegend") }),
          text: t("kitTeams.orderInfo"),
          title: t("kitTeams.orderLegend"),
        }}
        initial={value.order}
        legend={t("kitTeams.orderLegend")}
        name="teamOrder"
        onChange={(next) => update({ order: next === "entered" ? "entered" : "random" })}
        options={(["random", "entered"] as const satisfies readonly TeamOrderMode[]).map(
          (mode) => ({
            value: mode,
            label: t(mode === "random" ? "kitTeams.orderRandom" : "kitTeams.orderEntered"),
          }),
        )}
        value={value.order}
      />
      {players !== "off" && (
        <TeamPlayers
          count={count}
          onChange={update}
          open={playersOpen}
          required={players === "required"}
          value={value}
        />
      )}
    </>
  );
}

interface TeamPlayersProps {
  readonly count: number;
  readonly onChange: (patch: Partial<TeamSetupValue>) => void;
  readonly open: boolean;
  readonly required: boolean;
  readonly value: TeamSetupValue;
}

/** The player list with its assignment to the teams: draw at random or choose by hand. */
function TeamPlayers({ count, onChange, open, required, value }: TeamPlayersProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const players = parsePlayers(value.playersText);
  const teamOf = (player: string) => {
    const index = value.assignment[player];
    return index !== undefined && index < count ? index : undefined;
  };
  const teamName = (index: number) => {
    const typed = value.names[index]?.trim();
    return typed !== undefined && typed !== ""
      ? typed
      : t("kitTeams.defaultName", { number: index + 1 });
  };

  function changeText(text: string) {
    // Assignments of names that are no longer in the list are dropped.
    const names = new Set(parsePlayers(text));
    const assignment = Object.fromEntries(
      Object.entries(value.assignment).filter(([player]) => names.has(player)),
    );
    onChange({ assignment, playersText: text });
  }

  function draw() {
    const assignment: Record<string, number> = {};
    splitIntoTeams(players, count).forEach((team, index) => {
      for (const player of team) assignment[player] = index;
    });
    onChange({ assignment });
  }

  function assign(player: string, choice: string) {
    const assignment = { ...value.assignment };
    if (choice === "") delete assignment[player];
    else assignment[player] = Number(choice);
    onChange({ assignment });
  }

  return (
    <section aria-labelledby={headingId} className="kit-players">
      <h3 id={headingId}>{t(required ? "kitPlayers.titleRequired" : "kitPlayers.title")}</h3>
      <details className="kit-disclosure" open={required || open || undefined}>
        <summary>{t("kitPlayers.summary")}</summary>
        <div className="kit-disclosure__body">
          <RosterPicker onChange={changeText} value={value.playersText} />
          <PlayerListField
            hint={t(required ? "kitPlayers.hintRequired" : "kitPlayers.hint")}
            onChange={changeText}
            value={value.playersText}
          />
          {players.length > 0 && (
            <>
              <Button disabled={players.length < 2} onClick={draw} variant="secondary">
                {t("kitPlayers.draw")}
              </Button>
              <ul aria-label={t("kitPlayers.assignment")} className="kit-players__list">
                {players.map((player) => (
                  <li key={player}>
                    <span>{player}</span>
                    <select
                      aria-label={t("kitPlayers.teamOf", { player })}
                      className="field__input"
                      onChange={(event) => assign(player, event.target.value)}
                      value={teamOf(player)?.toString() ?? ""}
                    >
                      <option value="">{t("kitPlayers.unassigned")}</option>
                      {Array.from({ length: count }, (_, index) => (
                        <option key={index} value={index}>
                          {teamName(index)}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
              <ul aria-label={t("kitPlayers.teams")} className="kit-players__teams">
                {Array.from({ length: count }, (_, index) => {
                  const members = players.filter((player) => teamOf(player) === index);
                  return (
                    <li key={index}>
                      <strong>{teamName(index)}:</strong>{" "}
                      {members.length > 0 ? members.join(", ") : t("kitPlayers.nobody")}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </details>
    </section>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { parsePlayers, splitIntoTeams } from "../../business/shared/players";
import {
  clampTeamCount,
  defaultTeamRules,
  type TeamOrderMode,
  type TeamRules,
  type TeamSetupValue,
} from "../../business/shared/teamSetup";
import { Button, Dialog } from "../components";
import { ChoiceGroup } from "./ChoiceGroup";

interface TeamsSetupProps {
  readonly onChange: (value: TeamSetupValue) => void;
  readonly rules?: TeamRules;
  readonly value: TeamSetupValue;
  /** Whether the game has a player list; the players are then drawn into the teams here. */
  readonly withPlayers?: boolean;
}

/**
 * Teams of a game: how many, a button that draws the players into the teams, one card per team with
 * its name and its players, and the order of the teams. A player who has no team yet waits in a card
 * "No team". A tap on a name asks for the team of that player; nothing else needs to be done by hand.
 * The value is controlled, the game reads the result with `buildTeams`.
 */
export function TeamsSetup({
  onChange,
  rules = defaultTeamRules,
  value,
  withPlayers = true,
}: TeamsSetupProps) {
  const { i18n, t } = useTranslation();
  const count = clampTeamCount(value.count, rules);
  const counts = Array.from(
    { length: rules.maxTeams - rules.minTeams + 1 },
    (_, index) => rules.minTeams + index,
  );
  const update = (patch: Partial<TeamSetupValue>) => onChange({ ...value, ...patch });
  // The player whose team is being chosen.
  const [picking, setPicking] = useState<string>();

  // The players of a team are always shown in alphabetical order of the interface language.
  const alphabetical = new Intl.Collator(i18n.language).compare;
  const everyone = parsePlayers(value.playersText).sort(alphabetical);
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
  const withoutTeam = withPlayers ? everyone.filter((player) => teamOf(player) === undefined) : [];
  const drawn = everyone.length > 0 && withoutTeam.length === 0;

  function draw() {
    const assignment: Record<string, number> = {};
    splitIntoTeams(everyone, count).forEach((team, index) => {
      for (const player of team) assignment[player] = index;
    });
    update({ assignment });
  }

  function choose(player: string, team: number | undefined) {
    const assignment = { ...value.assignment };
    if (team === undefined) delete assignment[player];
    else assignment[player] = team;
    update({ assignment });
    setPicking(undefined);
  }

  const names = (players: readonly string[]) => (
    <div className="kit-team__names">
      {players.map((player) => (
        <button className="kit-name" key={player} onClick={() => setPicking(player)} type="button">
          {player}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <ChoiceGroup
        initial={String(count)}
        legend={t("kitTeams.legend")}
        name="teamCount"
        onChange={(next) => update({ count: Number(next) })}
        options={counts.map((number) => ({ value: String(number), label: String(number) }))}
        value={String(count)}
      />
      {withPlayers && everyone.length > 0 && (
        <Button disabled={everyone.length < 2} onClick={draw} variant="secondary">
          {t(drawn ? "kitTeams.redraw" : "kitTeams.draw")}
        </Button>
      )}
      <div className="kit-teams">
        {Array.from({ length: count }, (_, index) => {
          const members = withPlayers ? everyone.filter((player) => teamOf(player) === index) : [];
          return (
            <div className="kit-team" key={index}>
              <input
                aria-label={t("kitTeams.nameLabel", { number: index + 1 })}
                autoComplete="off"
                className="field__input"
                maxLength={rules.maxNameLength}
                onChange={(event) => {
                  const next = Array.from({ length: count }, (_, at) => value.names[at] ?? "");
                  next[index] = event.target.value;
                  update({ names: next });
                }}
                placeholder={t("kitTeams.defaultName", { number: index + 1 })}
                value={value.names[index] ?? ""}
              />
              {members.length > 0 && names(members)}
            </div>
          );
        })}
        {withoutTeam.length > 0 && (
          <div className="kit-team kit-team--none">
            <h3>{t("kitPlayers.noTeam")}</h3>
            {names(withoutTeam)}
          </div>
        )}
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
      <Dialog
        closeLabel={t("settings.close")}
        onClose={() => setPicking(undefined)}
        open={picking !== undefined}
        title={t("kitTeams.pickTitle", { player: picking ?? "" })}
      >
        {picking !== undefined && (
          <div className="kit-pick">
            {Array.from({ length: count }, (_, index) => (
              <Button
                aria-pressed={teamOf(picking) === index}
                key={index}
                onClick={() => choose(picking, index)}
                variant={teamOf(picking) === index ? "primary" : "secondary"}
              >
                {teamName(index)}
              </Button>
            ))}
            <Button
              aria-pressed={teamOf(picking) === undefined}
              onClick={() => choose(picking, undefined)}
              variant={teamOf(picking) === undefined ? "primary" : "secondary"}
            >
              {t("kitPlayers.noTeam")}
            </Button>
          </div>
        )}
      </Dialog>
    </>
  );
}

import { useTranslation } from "react-i18next";
import type { LineupConfig } from "../../business/shared/lineup";
import { addPlayersToText } from "../../business/shared/playerList";
import { parsePlayers } from "../../business/shared/players";
import { sameTeamSetup } from "../../business/shared/savedTeamSetup";
import { clampTeamCount, type TeamSetupValue } from "../../business/shared/teamSetup";
import { Button, ConfirmButton } from "../components";
import { PlayersSetup } from "./PlayersSetup";
import { SetupTabs, type SetupTab } from "./SetupTabs";
import { TeamsSetup } from "./TeamsSetup";
import { useTeamSetupMemory } from "./TeamSetupMemoryContext";

interface LineupSetupProps {
  /** What the game needs: a player list, teams, both. */
  readonly config: LineupConfig;
  readonly onChange: (value: TeamSetupValue) => void;
  readonly value: TeamSetupValue;
}

/** Keeps only the assignments of players that are in the list. */
function assignmentOf(
  assignment: TeamSetupValue["assignment"],
  playersText: string,
): TeamSetupValue["assignment"] {
  const names = new Set(parsePlayers(playersText));
  return Object.fromEntries(Object.entries(assignment).filter(([player]) => names.has(player)));
}

/**
 * The line-up of any game, built from its `LineupConfig`: a collapsible box "Players" when the game
 * has a player list and a collapsible box "Teams" when it has teams. A game without teams (everyone
 * plays for himself) shows only the players, a game that does not need names (like Taboo) has the
 * player box collapsed. Each box can take over what was remembered from the last game (of any
 * game; the teams come with their players); each box also has a button that clears it (the players, or the team names and the assignment). The
 * buttons are always there and cannot be used when they would change nothing.
 */
export function LineupSetup({ config, onChange, value }: LineupSetupProps) {
  const { t } = useTranslation();
  const rules = config.teams === "off" ? undefined : config.teams;
  const hasPlayers = config.players !== "off";
  const playerCount = parsePlayers(value.playersText).length;
  const remembered = useTeamSetupMemory()?.read();

  // What each box would take over; the button can only be used when it would change something.
  const savedPlayers = remembered?.playersText ?? "";
  const showLoadPlayers = savedPlayers.trim() !== "" && savedPlayers !== value.playersText;
  // The teams come with their players: those who are not in the list yet are added to it.
  const present = new Set(parsePlayers(value.playersText));
  const missing = hasPlayers
    ? Object.keys(remembered?.assignment ?? {}).filter((player) => !present.has(player))
    : [];
  const loadedPlayers =
    missing.length > 0
      ? addPlayersToText(value.playersText, missing.join(", "))
      : value.playersText;
  const loadedTeams: TeamSetupValue | undefined =
    remembered && rules
      ? {
          ...value,
          assignment: hasPlayers ? assignmentOf(remembered.assignment, loadedPlayers) : {},
          count: clampTeamCount(remembered.count, rules),
          names: remembered.names,
          order: remembered.order,
          playersText: loadedPlayers,
        }
      : undefined;
  const hasSavedTeams =
    remembered !== undefined &&
    rules !== undefined &&
    (remembered.names.some((name) => name.trim() !== "") ||
      Object.keys(remembered.assignment).length > 0 ||
      remembered.count !== rules.defaultTeams);
  const showLoadTeams =
    hasSavedTeams && loadedTeams !== undefined && !sameTeamSetup(loadedTeams, value);

  const nothingToClear =
    Object.keys(value.assignment).length === 0 && value.names.every((name) => name.trim() === "");

  const tabs: SetupTab[] = [];
  if (hasPlayers) {
    tabs.push({
      content: (
        <PlayersSetup
          above={
            <div className="kit-players__actions">
              <Button
                disabled={!showLoadPlayers}
                onClick={() =>
                  onChange({
                    ...value,
                    assignment: assignmentOf(value.assignment, savedPlayers),
                    playersText: savedPlayers,
                  })
                }
                variant="secondary"
              >
                {t("kitPlayers.loadLast")}
              </Button>
              <ConfirmButton
                armedContent={t("kitSetup.sure")}
                armedLabel={t("kitPlayers.clearConfirm")}
                disabled={playerCount === 0}
                idleLabel={t("kitPlayers.clear")}
                onConfirm={() => onChange({ ...value, assignment: {}, playersText: "" })}
              >
                {t("kitPlayers.clear")}
              </ConfirmButton>
            </div>
          }
          onChange={onChange}
          value={value}
        />
      ),
      id: "players",
      // The tabs name what can be chosen, not what is chosen: a game that needs its players says how many
      // (from - to); with an optional player list the name stands alone.
      label:
        config.players === "required"
          ? t("kitSetup.playersTabRange", {
              maximum: config.maxPlayers,
              minimum: config.minPlayers,
            })
          : t("kitSetup.playersTab"),
    });
  }
  if (rules) {
    tabs.push({
      content: (
        <>
          <div className="kit-players__actions">
            <Button
              disabled={!showLoadTeams}
              onClick={() => loadedTeams && onChange(loadedTeams)}
              variant="secondary"
            >
              {t("kitTeams.loadLastTeams")}
            </Button>
            <ConfirmButton
              armedContent={t("kitSetup.sure")}
              armedLabel={t("kitTeams.clearConfirm")}
              disabled={nothingToClear}
              idleLabel={t("kitTeams.clear")}
              onConfirm={() => onChange({ ...value, assignment: {}, names: [] })}
            >
              {t("kitTeams.clear")}
            </ConfirmButton>
          </div>
          <TeamsSetup onChange={onChange} rules={rules} value={value} withPlayers={hasPlayers} />
        </>
      ),
      id: "teams",
      label: t("kitSetup.teamsTab", { maximum: rules.maxTeams, minimum: rules.minTeams }),
    });
  }

  // Names are only needed when the game asks for them; otherwise the teams come first.
  return (
    <SetupTabs
      ariaLabel={t("kitSetup.lineupTabs")}
      initial={config.players === "required" || rules === undefined ? "players" : "teams"}
      tabs={tabs}
    />
  );
}

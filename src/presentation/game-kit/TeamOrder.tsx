import { useTranslation } from "react-i18next";
import {
  isDefaultOrder,
  moveTeam,
  normalizeOrder,
  randomOrder,
} from "../../business/shared/teamOrder";
import { Button, Icon } from "../components";
import { HeadingLegend } from "./HeadingLegend";
import { OrderList } from "./OrderList";

interface TeamOrderProps {
  /** Number of teams of the game. */
  readonly count: number;
  readonly onChange: (order: readonly number[]) => void;
  readonly order: readonly number[];
  /** The shown name of a team (its typed name or "Team 1"). */
  readonly teamName: (team: number) => string;
}

/**
 * The playing order of all teams, one below the other with fixed places 1, 2, 3 ...: the team at the
 * top starts. A team is dragged by its handle to another place (mouse or finger); with the keyboard
 * the arrow keys on the handle move it. The dice button mixes all teams. The info button stands next
 * to the heading, and the heading opens the same info window.
 */
export function TeamOrder({ count, onChange, order, teamName }: TeamOrderProps) {
  const { t } = useTranslation();
  const current = normalizeOrder(order, count);
  return (
    <fieldset className="kit-choice-group">
      <HeadingLegend legend={t("kitTeams.orderLegend")}>
        <span className="kit-order__actions">
          <Button
            aria-label={t("kitTeams.orderDefault")}
            className="kit-heading-button"
            disabled={isDefaultOrder(order, count)}
            onClick={() => onChange([])}
            title={t("kitTeams.orderDefault")}
            variant="secondary"
          >
            <Icon name="reset" />
          </Button>
          <Button
            aria-label={t("kitTeams.orderRandom")}
            className="kit-heading-button"
            onClick={() => onChange(randomOrder(count))}
            title={t("kitTeams.orderRandom")}
            variant="secondary"
          >
            <Icon name="shuffle" />
          </Button>
        </span>
      </HeadingLegend>
      <OrderList
        items={current.map((team) => ({ key: String(team), label: teamName(team) }))}
        moveLabel={(place, team) => t("kitTeams.orderMove", { place, team })}
        onMove={(key, to) => {
          const team = Number(key);
          const from = current.indexOf(team);
          if (from !== to) onChange(moveTeam(current, count, from, to));
        }}
      />
    </fieldset>
  );
}

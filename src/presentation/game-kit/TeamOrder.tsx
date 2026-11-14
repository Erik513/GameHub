import {
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useTranslation } from "react-i18next";
import {
  isDefaultOrder,
  moveTeam,
  normalizeOrder,
  randomOrder,
} from "../../business/shared/teamOrder";
import { Button, Icon } from "../components";
import { InfoButton } from "./InfoButton";

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
 * the arrow keys on the handle move it. "Random" mixes all teams, "Default" brings back team 1,
 * team 2, team 3 and so on.
 */
export function TeamOrder({ count, onChange, order, teamName }: TeamOrderProps) {
  const { t } = useTranslation();
  const current = normalizeOrder(order, count);
  const list = useRef<HTMLOListElement>(null);
  // The team that is being dragged.
  const [dragged, setDragged] = useState<number>();

  /** The place under the pointer, from the rows as they are on the screen right now. */
  function placeAt(y: number): number {
    // The list is there as long as a drag can be started on one of its rows.
    const rows = [...list.current!.children];
    const at = rows.findIndex((row) => y < row.getBoundingClientRect().bottom);
    return at < 0 ? Math.max(0, rows.length - 1) : at;
  }

  function startDrag(team: number) {
    return (event: ReactPointerEvent) => {
      if (event.button !== 0) return;
      event.preventDefault();
      setDragged(team);
      let latest = current;
      const move = (moved: PointerEvent) => {
        const from = latest.indexOf(team);
        const to = placeAt(moved.clientY);
        if (to === from) return;
        latest = moveTeam(latest, count, from, to);
        onChange(latest);
      };
      const end = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
        setDragged(undefined);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
    };
  }

  function keyMove(place: number) {
    return (event: KeyboardEvent) => {
      const step = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
      if (step === 0) return;
      event.preventDefault();
      onChange(moveTeam(current, count, place, place + step));
    };
  }

  return (
    <fieldset className="kit-choice-group kit-choice-group--info">
      <legend>{t("kitTeams.orderLegend")}</legend>
      <InfoButton
        closeLabel={t("settings.close")}
        label={t("kitSetup.infoLabel", { setting: t("kitTeams.orderLegend") })}
        text={t("kitTeams.orderInfo")}
        title={t("kitTeams.orderLegend")}
      />
      <ol className="kit-order" ref={list}>
        {current.map((team, place) => (
          <li className="kit-order__row" data-dragging={dragged === team || undefined} key={team}>
            <span className="kit-order__place">{place + 1}.</span>
            <span className="kit-order__name">{teamName(team)}</span>
            <button
              aria-label={t("kitTeams.orderMove", { place: place + 1, team: teamName(team) })}
              className="kit-order__handle"
              onKeyDown={keyMove(place)}
              onPointerDown={startDrag(team)}
              type="button"
            >
              <Icon name="grip" />
            </button>
          </li>
        ))}
      </ol>
      <div className="kit-players__actions">
        <Button
          disabled={isDefaultOrder(order, count)}
          onClick={() => onChange([])}
          variant="secondary"
        >
          {t("kitTeams.orderDefault")}
        </Button>
        <Button onClick={() => onChange(randomOrder(count))} variant="secondary">
          {t("kitTeams.orderRandom")}
        </Button>
      </div>
    </fieldset>
  );
}

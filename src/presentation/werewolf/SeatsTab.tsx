import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { WerewolfLineup } from "../../business/games/werewolf/lineup";
import { Icon } from "../components";
import { SeatCircle } from "./SeatCircle";
import { useSeatReorder } from "./useSeatReorder";

interface SeatsTabProps {
  readonly lineup: WerewolfLineup;
  readonly onMove: (name: string, toIndex: number) => void;
}

/**
 * The tab "Seats": the circle of all players with the narrator below it, and under it the list in
 * which the order is set. A name is dragged by its handle (or moved with the arrow keys on the handle)
 * to the place where the person really sits; the first sits at the left, the others clockwise.
 */
export function SeatsTab({ lineup, onMove }: SeatsTabProps) {
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState("");
  const { dragging, handleProps } = useSeatReorder({
    onMove: (name, toIndex) => {
      const target = Math.min(Math.max(toIndex, 0), lineup.seats.length - 1);
      if (target === lineup.seats.indexOf(name)) return;
      onMove(name, target);
      setAnnouncement(t("werewolfLineup.moved", { number: target + 1, player: name }));
    },
  });

  if (lineup.seats.length === 0) return <p>{t("werewolfLineup.seatsEmpty")}</p>;
  return (
    <>
      <p className="ww-hint">{t("werewolfLineup.seatsHint")}</p>
      <SeatCircle narrator={lineup.narrator} seats={lineup.seats} />
      <p className="ww-hint">{t("werewolfLineup.holdHint")}</p>
      <ol aria-label={t("werewolfLineup.seatsLabel")} className="ww-seats">
        {lineup.seats.map((name, index) => (
          <li
            className="ww-seat"
            data-dragging={dragging === name || undefined}
            data-seat-row=""
            key={name}
          >
            <span className="ww-seat__number">
              <span className="visually-hidden">
                {t("werewolfLineup.seat", { number: index + 1 })}:{" "}
              </span>
              <span aria-hidden="true">{index + 1}</span>
            </span>
            <span className="ww-seat__name">{name}</span>
            <button
              aria-label={t("werewolfLineup.move", { player: name })}
              className="ww-seat__handle"
              type="button"
              {...handleProps(name, index)}
            >
              <Icon name="grip" />
            </button>
          </li>
        ))}
      </ol>
      <p aria-live="polite" className="visually-hidden" role="status">
        {announcement}
      </p>
    </>
  );
}

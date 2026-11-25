import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { narratorPosition, seatPosition } from "./seatPosition";

/** The example has this many seats besides the narrator. */
const exampleSeats = 6;

/**
 * A picture for the explanation of the seats: the same circle as the real one, with the numbers of the
 * seats instead of names, so it is clear at once where seat 1 is and where the numbers go. It is only
 * a picture (hidden from screen readers; the text next to it says the same).
 */
export function SeatExample() {
  const { t } = useTranslation();
  const seats = Array.from({ length: exampleSeats }, (_unused, index) => index + 1);
  return (
    <div aria-hidden="true" className="ww-circle ww-example">
      <div
        className="ww-circle__ring"
        style={{ "--seat-count": exampleSeats + 1 } as CSSProperties}
      >
        {seats.map((number, index) => (
          <span
            className="ww-tile"
            data-selected={number === 1 || undefined}
            key={number}
            style={seatPosition(index, exampleSeats)}
          >
            {number}
          </span>
        ))}
        <span className="ww-tile ww-tile--narrator" style={narratorPosition}>
          {t("werewolfLineup.narratorSeat").slice(0, 1)}
        </span>
      </div>
      <p className="ww-circle__narrator-label">{t("werewolfLineup.exampleCaption")}</p>
    </div>
  );
}

import { useState, type CSSProperties, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { narratorPosition, seatPosition } from "./seatPosition";

function initial(name: string): string {
  const [first = ""] = Array.from(name.trim());
  return first.toLocaleUpperCase();
}

interface TileProps {
  readonly className?: string;
  readonly empty?: boolean;
  readonly selected: boolean;
  readonly letter: string;
  /** The name that shows when the tile is tapped; the circle finds the tapped tile by it. */
  readonly name?: string;
  readonly style?: CSSProperties;
}

/** One tile of the circle. It does nothing itself: the circle reads which tile was tapped. */
function Tile({ className = "", empty, selected, letter, name, style }: TileProps) {
  return (
    <span
      className={`ww-tile ${className}`.trim()}
      data-empty={empty === true ? true : undefined}
      data-selected={selected || undefined}
      data-seat-name={name}
      style={style}
    >
      {letter}
    </span>
  );
}

/** The name of the tile an element belongs to, if it is a tile. */
function nameOf(element: EventTarget | null): string | undefined {
  return element instanceof Element
    ? element.closest<HTMLElement>("[data-seat-name]")?.dataset.seatName
    : undefined;
}

interface SeatCircleProps {
  readonly narrator: string | null;
  /** The players in the order they sit; the first sits at the left, then clockwise. */
  readonly seats: readonly string[];
}

/**
 * The seat circle: every player is a tile with the first letter of the name, seat 1 right next to the
 * narrator on the left and the others clockwise. The narrator has a fixed place below the circle (it is not a seat). A tap
 * on a tile shows the full name in the box above and marks the tile; a tap on another tile shows that one, a second tap
 * on the same tile clears the choice. The circle is a picture; the list of the seats next to it is the accessible
 * version, so the tiles are hidden from screen readers.
 */
export function SeatCircle({ narrator, seats }: SeatCircleProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string>();

  function tap(event: MouseEvent) {
    const name = nameOf(event.target);
    // A tap beside the tiles changes nothing.
    if (name === undefined) return;
    setSelected((current) => (current === name ? undefined : name));
  }

  return (
    <div className="ww-circle">
      <p className="ww-circle__name" data-selected={selected === undefined ? undefined : true}>
        {selected ?? t("werewolfLineup.tapHint")}
      </p>
      <div
        aria-hidden="true"
        className="ww-circle__ring"
        onClick={tap}
        style={{ "--seat-count": seats.length + 1 } as CSSProperties}
      >
        {seats.map((name, index) => (
          <Tile
            key={name}
            letter={initial(name)}
            name={name}
            selected={selected === name}
            style={seatPosition(index, seats.length)}
          />
        ))}
        <Tile
          className="ww-tile--narrator"
          empty={narrator === null}
          letter={narrator === null ? "?" : initial(narrator)}
          selected={narrator !== null && selected === narrator}
          style={narratorPosition}
          {...(narrator === null ? {} : { name: narrator })}
        />
      </div>
      <p aria-hidden="true" className="ww-circle__narrator-label">
        {t("werewolfLineup.narratorSeat")}
      </p>
    </div>
  );
}

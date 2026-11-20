import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useTranslation } from "react-i18next";
import { narratorPosition, seatPosition } from "./seatPosition";

/** How long a tile is held before the full name shows; then the name follows the finger over the tiles. */
const holdMs = 250;
function initial(name: string): string {
  const [first = ""] = Array.from(name.trim());
  return first.toLocaleUpperCase();
}

interface TileProps {
  readonly className?: string;
  readonly empty?: boolean;
  readonly held: boolean;
  readonly letter: string;
  /** The name that shows when the tile is held; the circle finds the tile under the finger by it. */
  readonly name?: string;
  readonly style?: CSSProperties;
}

/** One tile of the circle. It does nothing itself: the circle reads which tile is under the finger. */
function Tile({ className = "", empty, held, letter, name, style }: TileProps) {
  return (
    <span
      className={`ww-tile ${className}`.trim()}
      data-empty={empty === true ? true : undefined}
      data-held={held || undefined}
      data-seat-name={name}
      style={style}
    >
      {letter}
    </span>
  );
}

/** The name of the tile an element belongs to, if it is a tile. */
function nameOf(element: Element | null | undefined): string | undefined {
  return element?.closest<HTMLElement>("[data-seat-name]")?.dataset.seatName;
}

/** The name of the tile that lies under a point of the screen, if there is one. */
function nameAt(x: number, y: number): string | undefined {
  return typeof document.elementFromPoint === "function"
    ? nameOf(document.elementFromPoint(x, y))
    : undefined;
}

interface SeatCircleProps {
  readonly narrator: string | null;
  /** The players in the order they sit; the first sits at the left, then clockwise. */
  readonly seats: readonly string[];
}

/**
 * The seat circle: every player is a tile with the first letter of the name, seat 1 right next to the
 * narrator on the left and the others clockwise. The narrator has a fixed place below the circle (it is not a seat). A tile
 * that is held shows the full name in the box above; while the finger (or the mouse button) stays down, the
 * name follows it from tile to tile, so nobody has to let go to look at another name. The circle is a picture; the list of the seats
 * next to it is the accessible version, so the tiles are hidden from screen readers.
 */
export function SeatCircle({ narrator, seats }: SeatCircleProps) {
  const { t } = useTranslation();
  const [held, setHeld] = useState<string>();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Where the finger is, and whether the name shows already (the finger was down long enough).
  const point = useRef({ x: 0, y: 0 });
  const holding = useRef(false);
  // The tile the finger came down on (the first guess when the time is up).
  const first = useRef<string | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function begin(event: PointerEvent) {
    point.current = { x: event.clientX, y: event.clientY };
    first.current = event.target instanceof Element ? nameOf(event.target) : undefined;
    clearTimeout(timer.current);
    // A finger is tied to the tile it touched first; letting go of that makes the moves reach the circle.
    if (event.target instanceof Element && event.target.hasPointerCapture?.(event.pointerId)) {
      event.target.releasePointerCapture(event.pointerId);
    }
    timer.current = setTimeout(() => {
      const name = nameAt(point.current.x, point.current.y) ?? first.current;
      if (name === undefined) return;
      holding.current = true;
      setHeld(name);
    }, holdMs);
  }

  function move(event: PointerEvent) {
    point.current = { x: event.clientX, y: event.clientY };
    if (!holding.current) return;
    // Between two tiles the name of the last one stays.
    const name = nameAt(event.clientX, event.clientY);
    if (name !== undefined) setHeld(name);
  }

  function end() {
    clearTimeout(timer.current);
    holding.current = false;
    setHeld(undefined);
  }

  return (
    <div className="ww-circle">
      <p className="ww-circle__name" data-held={held === undefined ? undefined : true}>
        {held ?? t("werewolfLineup.holdHint")}
      </p>
      <div
        aria-hidden="true"
        className="ww-circle__ring"
        onContextMenu={(event) => event.preventDefault()}
        onPointerCancel={end}
        onPointerDown={begin}
        onPointerLeave={end}
        onPointerMove={move}
        onPointerUp={end}
        style={{ "--seat-count": seats.length + 1 } as CSSProperties}
      >
        {seats.map((name, index) => {
          return (
            <Tile
              held={held === name}
              key={name}
              letter={initial(name)}
              name={name}
              style={seatPosition(index, seats.length)}
            />
          );
        })}
        <Tile
          className="ww-tile--narrator"
          empty={narrator === null}
          held={narrator !== null && held === narrator}
          letter={narrator === null ? "?" : initial(narrator)}
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

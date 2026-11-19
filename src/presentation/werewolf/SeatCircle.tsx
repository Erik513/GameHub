import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

/** How long a tile is held before the full name shows. */
const holdMs = 250;
/** The tiles sit on a circle that is this share (in percent) of the width, from the middle. */
const ringRadius = 38;

function initial(name: string): string {
  const [first = ""] = Array.from(name.trim());
  return first.toLocaleUpperCase();
}

interface HoldTileProps {
  readonly className?: string;
  readonly empty?: boolean;
  readonly held: boolean;
  readonly letter: string;
  /** The tile was held (with the name), or let go again (nothing). */
  readonly onHold: (name: string | undefined) => void;
  readonly name?: string;
  readonly style?: CSSProperties;
}

/** A tile that reports itself when it is held for a moment (a finger or the mouse) and when it is let go. */
function HoldTile({ className = "", empty, held, letter, name, onHold, style }: HoldTileProps) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  function end() {
    clearTimeout(timer.current);
    onHold(undefined);
  }

  return (
    <span
      className={`ww-tile ${className}`.trim()}
      data-empty={empty === true ? true : undefined}
      data-held={held || undefined}
      onContextMenu={(event) => event.preventDefault()}
      onPointerCancel={end}
      onPointerDown={() => {
        if (name === undefined) return;
        clearTimeout(timer.current);
        timer.current = setTimeout(() => onHold(name), holdMs);
      }}
      onPointerLeave={end}
      onPointerUp={end}
      style={style}
    >
      {letter}
    </span>
  );
}

interface SeatCircleProps {
  readonly narrator: string | null;
  /** The players in the order they sit; the first sits at the left, then clockwise. */
  readonly seats: readonly string[];
}

/**
 * The seat circle: every player is a tile with the first letter of the name, the first one at the left
 * and the others clockwise. The narrator has a fixed place below the circle (it is not a seat). A tile
 * that is held shows the full name in the line above. The circle is a picture; the list of the seats
 * next to it is the accessible version, so the tiles are hidden from screen readers.
 */
export function SeatCircle({ narrator, seats }: SeatCircleProps) {
  const { t } = useTranslation();
  const [held, setHeld] = useState<string>();

  return (
    <div aria-hidden="true" className="ww-circle">
      <p className="ww-circle__name">{held ?? " "}</p>
      <div className="ww-circle__ring" style={{ "--seat-count": seats.length } as CSSProperties}>
        {seats.map((name, index) => {
          // The first seat is at the left; going on, the angle grows (clockwise on the screen).
          const angle = Math.PI + (index * 2 * Math.PI) / seats.length;
          return (
            <HoldTile
              held={held === name}
              key={name}
              letter={initial(name)}
              name={name}
              onHold={setHeld}
              style={{
                left: `${50 + ringRadius * Math.cos(angle)}%`,
                top: `${50 + ringRadius * Math.sin(angle)}%`,
              }}
            />
          );
        })}
      </div>
      <div className="ww-circle__narrator">
        <HoldTile
          className="ww-tile--narrator"
          empty={narrator === null}
          held={narrator !== null && held === narrator}
          letter={narrator === null ? "?" : initial(narrator)}
          onHold={setHeld}
          {...(narrator === null ? {} : { name: narrator })}
        />
        <span className="ww-circle__narrator-label">{t("werewolfLineup.narratorSeat")}</span>
      </div>
    </div>
  );
}

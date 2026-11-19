import type { CSSProperties } from "react";

/** The tiles sit on a circle that is this share (in percent) of the width, from the middle. */
const ringRadius = 38;

/** Where the tile of seat `index` (counted from 0) sits, in percent of the ring; the narrator is the place at the bottom. */
export function seatPosition(index: number, seatCount: number): CSSProperties {
  // Seat 1 is right next to the narrator on the left, and the angle grows clockwise on the screen.
  const angle = Math.PI / 2 + ((index + 1) * 2 * Math.PI) / (seatCount + 1);
  return {
    left: `${50 + ringRadius * Math.cos(angle)}%`,
    top: `${50 + ringRadius * Math.sin(angle)}%`,
  };
}

/** The place of the narrator: at the bottom of the ring. */
export const narratorPosition: CSSProperties = { left: "50%", top: `${50 + ringRadius}%` };

import { useEffect, useState } from "react";

/** One piece of confetti: where it starts, how it falls and how it looks. */
interface Piece {
  readonly color: string;
  readonly delay: number;
  readonly drift: number;
  readonly duration: number;
  readonly left: number;
  readonly size: number;
  readonly spin: number;
}

const colors = [
  "var(--color-accent)",
  "var(--color-success)",
  "var(--color-medium)",
  "var(--color-danger-fill)",
  "var(--color-ink)",
] as const;

/**
 * The shower lasts about seven seconds: the pieces start one after another over two and a half
 * seconds and each one falls for three to four and a half seconds.
 */
const pieceCount = 110;
const maxDelay = 2.5;
const maxDuration = 4.5;
/** A little longer than the longest fall (delay plus duration), then the pieces are removed. */
const lifetimeMs = (maxDelay + maxDuration) * 1000 + 500;

function makePieces(): readonly Piece[] {
  return Array.from({ length: pieceCount }, (_, index) => ({
    color: colors[index % colors.length] ?? colors[0],
    delay: Math.random() * maxDelay,
    drift: (Math.random() - 0.5) * 160,
    duration: 3 + Math.random() * (maxDuration - 3),
    left: Math.random() * 100,
    size: 6 + Math.random() * 6,
    spin: 360 + Math.random() * 720,
  }));
}

function reducedMotion(): boolean {
  return typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

/**
 * A short shower of confetti over the whole screen, for example when the game is won. It is only
 * decoration: it takes no taps, is hidden from screen readers, disappears by itself and is not shown
 * at all when the device asks for less motion.
 */
export function Confetti() {
  const [pieces, setPieces] = useState<readonly Piece[] | undefined>(() =>
    reducedMotion() ? undefined : makePieces(),
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setPieces(undefined), lifetimeMs);
    return () => window.clearTimeout(timer);
  }, []);

  if (!pieces) return null;
  return (
    <div aria-hidden="true" className="kit-confetti" data-testid="confetti">
      {pieces.map((piece, index) => (
        <span
          className="kit-confetti__piece"
          key={index}
          style={{
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            background: piece.color,
            height: `${piece.size * 1.6}px`,
            left: `${piece.left}%`,
            width: `${piece.size}px`,
            ["--confetti-drift" as string]: `${piece.drift}px`,
            ["--confetti-spin" as string]: `${piece.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}

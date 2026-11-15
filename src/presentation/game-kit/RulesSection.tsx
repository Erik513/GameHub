import type { ReactNode } from "react";

/**
 * One part of a rules window: a short heading and its content. A game builds its rules window from a
 * few of these (goal, how a turn goes, game modes, settings), each with only a sentence or two.
 */
export function RulesSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="kit-rules-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

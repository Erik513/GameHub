/** One team in the side panel of a turn. */
export interface SidebarRow {
  /** True for the team that is on the move. */
  readonly active?: boolean;
  readonly id: string;
  readonly name: string;
  /** True for a team that is out (the mode "Gegen die Zeit"). */
  readonly out?: boolean;
  /** What the team has, for example the points, a time or the time that is left. */
  readonly value: string;
}

/**
 * The side panel of a turn at the PC (from 64 rem): the standing of every team, the team on the move
 * marked. It is not shown on a phone, where the turn keeps to the card and the buttons.
 */
export function TabooTurnSidebar({
  rows,
  title,
}: {
  readonly rows: readonly SidebarRow[];
  readonly title: string;
}) {
  return (
    <aside aria-label={title} className="taboo-turn-sidebar">
      <p className="taboo-turn-sidebar__title">{title}</p>
      <ol>
        {rows.map((row) => (
          <li data-active={row.active ?? false} data-out={row.out ?? false} key={row.id}>
            <span className="taboo-turn-sidebar__name">{row.name}</span>
            <span className="taboo-turn-sidebar__value">{row.value}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

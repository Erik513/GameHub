/** The groups of the player list one below the other; a tap on a group opens its players. */
export function GroupButtons({
  groups,
  label,
  onOpen,
}: {
  readonly groups: readonly {
    readonly count: string;
    readonly key: string;
    readonly title: string;
  }[];
  readonly label: string;
  readonly onOpen: (key: string) => void;
}) {
  return (
    <ul aria-label={label} className="kit-groups">
      {groups.map((group) => (
        <li key={group.key}>
          <button className="kit-group-row" onClick={() => onOpen(group.key)} type="button">
            <span className="kit-group-row__name">{group.title}</span>
            <span className="kit-group-row__count">{group.count}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** The players of a list as ticked or unticked rows; `isChecked` and `onToggle` decide the state. */
export function PlayerChecklist({
  isChecked,
  label,
  onToggle,
  players,
}: {
  readonly isChecked: (player: string) => boolean;
  readonly label: string;
  readonly onToggle: (player: string, checked: boolean) => void;
  readonly players: readonly string[];
}) {
  return (
    <ul aria-label={label} className="kit-roster__list kit-roster__list--pick">
      {players.map((player) => (
        <li key={player}>
          <label>
            <input
              checked={isChecked(player)}
              onChange={(event) => onToggle(player, event.target.checked)}
              type="checkbox"
            />
            <span>{player}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

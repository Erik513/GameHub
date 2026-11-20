import type { ReactNode } from "react";
import type { FixedItemView } from "../../business/games/werewolf/fixedConfiguration";
import { ConfigInfo, type ConfigInfoId } from "./ConfigInfo";
import { useLockHint } from "./useLockHint";

interface RoleTileProps {
  readonly infoId: ConfigInfoId;
  readonly lock: FixedItemView["lock"] | "wolves";
  readonly minimum: number;
  /** The role (or the extra): the main text of the tile. */
  readonly name: string;
  /** A short note in the second line that is no option of the role, for example "(not together with …)". */
  readonly note?: string | undefined;
  readonly onToggle: () => void;
  readonly selected: boolean;
  /** Without it the tile has no "i" inside (a role in a list has its "i" outside, see RoleRow). */
  readonly showInfo?: boolean;
  /** The second line: the special text, for example the option of the role. */
  readonly sub?: string;
}

/**
 * Every role (and every extra) looks the same: one button with the name of the role as the main text and,
 * in a second line, the special text of the role (its option). While the role cannot be chosen because of the
 * chosen roles, the reason ("no place free", "not together") stands in brackets next to the name.
 * The "i" button stands inside the tile; a locked tile cannot be chosen but still explains why.
 * A role with options is one split tile (see `ww-split`): a row of such tiles joined into one button, one
 * for every option, each with the name of the role and its option.
 */
export function RoleTile({
  infoId,
  lock,
  minimum,
  name,
  note,
  onToggle,
  selected,
  showInfo = true,
  sub,
}: RoleTileProps) {
  const lockHint = useLockHint();
  // Not enough players is told in the window of the role (a box next to its name); the button only names the
  // reasons that depend on the chosen roles.
  // A role with a note says "not together" itself, so the bracket for that reason is left out.
  const hint =
    lock === "minimumPlayers" || (lock === "combination" && note !== undefined)
      ? undefined
      : lockHint(lock);
  return (
    <div className="kit-choice-wrap ww-tile-wrap" data-locked={lock === null ? undefined : true}>
      <label className="kit-choice">
        <input
          aria-label={sub === undefined ? name : `${name}, ${sub}`}
          checked={selected}
          disabled={lock !== null}
          onChange={onToggle}
          type="checkbox"
        />
        <span>
          <strong className="ww-tile__main">
            {name}
            {/* Why the role is locked stands in brackets next to the name; the second line stays for the text of the role. */}
            {hint && <em className="ww-tile__lock"> ({hint})</em>}
          </strong>
          {(sub ?? note) && <small>{sub ?? note}</small>}
        </span>
      </label>
      {showInfo && (
        <ConfigInfo
          className="kit-info-button--option"
          id={infoId}
          lock={lock}
          minimum={minimum}
          name={name}
        />
      )}
    </div>
  );
}

interface RoleRowProps {
  readonly children: ReactNode;
  /** Only for the mayor: whether the hammer is available (shown as a second box in the window). */
  readonly hammerOk?: boolean;
  readonly infoId: ConfigInfoId;
  readonly lock: FixedItemView["lock"] | "wolves";
  readonly minimum: number;
  /** The name of the role, for the "i" button. */
  readonly name: string;
}

/**
 * A role in the list takes one row: the button (a single tile, or the joined halves of a role with options) over the
 * whole width and, outside of it on the right, the one "i" button. For a role with options the explanation
 * describes every option.
 */
export function RoleRow({ children, hammerOk, infoId, lock, minimum, name }: RoleRowProps) {
  return (
    <div className="ww-role">
      <div className="ww-role__control">{children}</div>
      <ConfigInfo
        className="ww-role__info"
        id={infoId}
        lock={lock}
        minimum={minimum}
        name={name}
        {...(hammerOk === undefined ? {} : { hammerOk })}
      />
    </div>
  );
}

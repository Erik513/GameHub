import type { FixedItemView } from "../../business/games/werewolf/fixedConfiguration";
import { ConfigInfo, type ConfigInfoId } from "./ConfigInfo";
import { useLockHint } from "./useLockHint";

interface RoleTileProps {
  readonly infoId: ConfigInfoId;
  readonly lock: FixedItemView["lock"] | "wolves";
  readonly minimum: number;
  readonly name: string;
  readonly onToggle: () => void;
  readonly selected: boolean;
}

/**
 * A role (or an extra) as one button that is chosen or not, with its "i" button beside it. A locked
 * tile cannot be chosen but still explains why.
 */
export function RoleTile({ infoId, lock, minimum, name, onToggle, selected }: RoleTileProps) {
  const lockHint = useLockHint();
  const hint = lockHint(lock, minimum);
  return (
    <div className="kit-choice-wrap ww-tile-wrap" data-locked={lock === null ? undefined : true}>
      <label className="kit-choice">
        <input checked={selected} disabled={lock !== null} onChange={onToggle} type="checkbox" />
        <span>
          {name}
          {hint && <small>{hint}</small>}
        </span>
      </label>
      <ConfigInfo
        className="kit-info-button--option"
        id={infoId}
        lock={lock}
        minimum={minimum}
        name={name}
      />
    </div>
  );
}

interface VariantTileProps {
  /** The choices; the chosen one is pressed. */
  readonly choices: readonly {
    readonly label: string;
    readonly locked?: boolean;
    readonly value: string;
  }[];
  readonly infoId: ConfigInfoId;
  readonly lock: FixedItemView["lock"];
  readonly minimum: number;
  readonly name: string;
  /** A tap on a choice; the chosen one is tapped again to leave the role out. */
  readonly onPick: (value: string | null) => void;
  readonly value: string | null;
}

/**
 * A role that is taken by picking one of its variants (for example the hunter with a free shot or
 * with the duty to shoot). Nothing picked means no role; tapping the picked variant again leaves
 * the role out. There is no switch besides the variants.
 */
export function VariantTile({
  choices,
  infoId,
  lock,
  minimum,
  name,
  onPick,
  value,
}: VariantTileProps) {
  const lockHint = useLockHint();
  const hint = lockHint(lock, minimum);
  return (
    <div
      className="ww-variant"
      data-locked={lock === null ? undefined : true}
      data-selected={value === null ? undefined : true}
    >
      <div className="ww-variant__head">
        <span className="ww-variant__title">
          <span className="ww-variant__name">{name}</span>
          {hint && <small>{hint}</small>}
        </span>
        <ConfigInfo
          className="kit-info-button--option"
          id={infoId}
          lock={lock}
          minimum={minimum}
          name={name}
        />
      </div>
      <div aria-label={name} className="ww-variant__choices" role="group">
        {choices.map((choice) => (
          <button
            aria-pressed={value === choice.value}
            className="ww-variant__button"
            disabled={lock !== null || (choice.locked === true && value !== choice.value)}
            key={choice.value}
            onClick={() => onPick(value === choice.value ? null : choice.value)}
            type="button"
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}

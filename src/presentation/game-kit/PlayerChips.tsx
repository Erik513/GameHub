import { useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { maxPlayerNameLength } from "../../business/shared/playerRoster";
import { Button, Icon } from "../components";

interface PlayerChipProps {
  readonly name: string;
  readonly onRemove: () => void;
  /** Starts dragging the player; the name is then draggable, and tapping it does `onTap`. */
  readonly onPointerDown?: (event: ReactPointerEvent) => void;
  /** Tapping the name; without it the name is only shown. */
  readonly onTap?: () => void;
  /** Accessible name of the name button, for example "Anna, Team 1". */
  readonly tapLabel?: string;
}

/** One player as a small name tag with a button to remove him. */
export function PlayerChip({ name, onPointerDown, onRemove, onTap, tapLabel }: PlayerChipProps) {
  const { t } = useTranslation();

  return (
    <li className="kit-chip">
      {onTap ? (
        <button
          aria-label={tapLabel}
          className="kit-chip__name kit-chip__name--drag"
          onClick={onTap}
          onPointerDown={onPointerDown}
          type="button"
        >
          {name}
        </button>
      ) : (
        <span className="kit-chip__name">{name}</span>
      )}
      <button
        aria-label={t("kitPlayers.removeLabel", { player: name })}
        className="kit-chip__remove"
        onClick={onRemove}
        type="button"
      >
        <Icon name="close" />
      </button>
    </li>
  );
}

/** The row of name tags of a team or of the players without a team. */
export function PlayerChips({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <ul aria-label={label} className="kit-chips">
      {children}
    </ul>
  );
}

/**
 * The field "Add player" with its plus button. Enter adds the name, too; the screen is a form,
 * so Enter must not start the game. Several names separated by commas are added together.
 */
export function PlayerAdder({ onAdd }: { readonly onAdd: (input: string) => void }) {
  const { t } = useTranslation();
  const [text, setText] = useState("");

  function add() {
    if (text.trim() === "") return;
    onAdd(text);
    setText("");
  }

  return (
    <div className="kit-adder">
      <input
        aria-label={t("kitPlayers.addLabel")}
        autoComplete="off"
        className="field__input"
        maxLength={maxPlayerNameLength * 4}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          add();
        }}
        placeholder={t("kitPlayers.addPlaceholder")}
        value={text}
      />
      <Button
        aria-label={t("kitPlayers.addButton")}
        className="icon-button"
        disabled={text.trim() === ""}
        onClick={add}
        variant="secondary"
      >
        <Icon name="plus" />
      </Button>
    </div>
  );
}

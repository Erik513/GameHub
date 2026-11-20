import { useState } from "react";
import { useTranslation } from "react-i18next";
import { maxPlayerNameLength } from "../../business/shared/playerRoster";
import { parsePlayers } from "../../business/shared/players";
import { Button, Icon } from "../components";

/**
 * The field "Add player" with its plus button. Enter adds the name, too; the screen is a form,
 * so Enter must not start the game. Several names separated by commas are added together.
 * With `room` (how many names can still be added) the field adds no more than that: the names beyond
 * it are left out and the field says so; with no room left the field is switched off.
 */
export function PlayerAdder({
  onAdd,
  room,
}: {
  readonly onAdd: (input: string) => void;
  readonly room?: number;
}) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [skipped, setSkipped] = useState<{ added: number; total: number } | null>(null);
  const full = room !== undefined && room <= 0;

  function add() {
    if (text.trim() === "" || full) return;
    const names = parsePlayers(text);
    if (room !== undefined && names.length > room) {
      onAdd(names.slice(0, room).join(", "));
      setSkipped({ added: room, total: names.length });
    } else {
      onAdd(text);
      setSkipped(null);
    }
    setText("");
  }

  return (
    <>
      <div className="kit-adder">
        <input
          aria-label={t("kitPlayers.addLabel")}
          autoComplete="off"
          className="field__input"
          disabled={full}
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
          disabled={full || text.trim() === ""}
          onClick={add}
          variant="secondary"
        >
          <Icon name="plus" />
        </Button>
      </div>
      {skipped && (
        <p className="kit-adder__notice" role="status">
          {t("kitPlayers.someAdded", skipped)}
        </p>
      )}
    </>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { maxPlayerNameLength } from "../../business/shared/playerRoster";
import { Button, Icon } from "../components";

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

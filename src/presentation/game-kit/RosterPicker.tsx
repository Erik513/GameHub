import { useState } from "react";
import { useTranslation } from "react-i18next";
import { applyRosterSelection, rosterPlayersIn } from "../../business/shared/playerRoster";
import { Button, Dialog, Icon } from "../components";
import { ActionRow } from "./ActionRow";
import { usePlayerRoster } from "./PlayerRosterContext";

interface RosterPickerProps {
  /** Receives the new text of the players field when the choice is applied. */
  readonly onChange: (text: string) => void;
  /** The text of the players field as it is now. */
  readonly value: string;
}

/**
 * The button "Choose from player list" and its window: tick who plays today. Chosen players are
 * added to the players field, deselected ones are removed; names typed by hand stay.
 */
export function RosterPicker({ onChange, value }: RosterPickerProps) {
  const { t } = useTranslation();
  const roster = usePlayerRoster();
  const [open, setOpen] = useState(false);

  if (!roster) return null;

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Icon name="users" />
        {t("kitRoster.pickOpen")}
      </Button>
      <Dialog
        closeLabel={t("settings.close")}
        description={t(roster.players.length > 0 ? "kitRoster.pickInfo" : "kitRoster.pickEmpty")}
        onClose={() => setOpen(false)}
        open={open}
        title={t("kitRoster.pickTitle")}
      >
        <PickerBody
          onApply={(text) => {
            onChange(text);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
          players={roster.players}
          value={value}
        />
      </Dialog>
    </>
  );
}

/** The content of the window; it is created anew on every opening, so the choice starts fresh. */
function PickerBody({
  onApply,
  onCancel,
  players,
  value,
}: {
  readonly onApply: (text: string) => void;
  readonly onCancel: () => void;
  readonly players: readonly string[];
  readonly value: string;
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<ReadonlySet<string>>(() =>
    rosterPlayersIn(value, players),
  );

  if (players.length === 0) return null;

  const toggle = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelected(next);
  };

  return (
    <div className="kit-roster">
      <Button
        onClick={() => setSelected(selected.size === players.length ? new Set() : new Set(players))}
        variant="secondary"
      >
        {t(selected.size === players.length ? "kitRoster.pickNone" : "kitRoster.pickAll")}
      </Button>
      <ul aria-label={t("kitRoster.listLabel")} className="kit-roster__list kit-roster__list--pick">
        {players.map((player) => (
          <li key={player}>
            <label>
              <input
                checked={selected.has(player)}
                onChange={() => toggle(player)}
                type="checkbox"
              />
              <span>{player}</span>
            </label>
          </li>
        ))}
      </ul>
      <ActionRow>
        <Button
          onClick={() => onApply(applyRosterSelection(value, players, selected))}
          variant="success"
        >
          {t("kitRoster.pickApply")}
        </Button>
        <Button onClick={onCancel} variant="danger">
          {t("kitRoster.pickCancel")}
        </Button>
      </ActionRow>
    </div>
  );
}

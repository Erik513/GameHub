import { useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { maxPlayerNameLength } from "../../business/shared/playerRoster";
import { Button, ConfirmButton, Dialog, Icon } from "../components";
import { usePlayerRoster } from "./PlayerRosterContext";
import { useWholeRows } from "./useWholeRows";

type Problem = "empty" | "invalid" | "duplicate" | "full";

/** The window to manage the saved players: add a name, delete a name. */
export function PlayerRosterDialog({ onClose, open }: { onClose: () => void; open: boolean }) {
  const { t } = useTranslation();
  const roster = usePlayerRoster();
  const [name, setName] = useState("");
  const [problem, setProblem] = useState<Problem>();
  // The list shows whole players only: its height is calculated in whole rows.
  const listRef = useRef<HTMLDivElement>(null);
  const listHeight = useWholeRows(listRef, roster?.players.length ?? 0, open);

  if (!roster) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = roster?.add(name);
    if (!result) return;
    if (result.ok) {
      setName("");
      setProblem(undefined);
    } else {
      setProblem(result.reason);
    }
  }

  function close() {
    onClose();
    setProblem(undefined);
    setName("");
  }

  return (
    <Dialog
      closeLabel={t("settings.close")}
      description={t("kitRoster.description")}
      onClose={close}
      open={open}
      size="large"
      title={t("kitRoster.title")}
    >
      <div className="kit-roster kit-roster--manage">
        <form className="kit-roster__add" noValidate onSubmit={submit}>
          <input
            aria-invalid={problem ? true : undefined}
            aria-label={t("kitRoster.nameLabel")}
            autoCapitalize="words"
            autoComplete="off"
            className="field__input"
            maxLength={maxPlayerNameLength}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("kitRoster.namePlaceholder")}
            value={name}
          />
          <Button
            aria-label={t("kitRoster.add")}
            className="kit-roster__plus"
            title={t("kitRoster.add")}
            type="submit"
            variant="success"
          >
            <Icon name="plus" />
          </Button>
        </form>
        {/* The line is always there, so the window keeps its size when a problem is shown. */}
        <p className="kit-roster__problem" {...(problem ? { role: "alert" } : {})}>
          {problem ? t(`kitRoster.problems.${problem}`) : "\u00a0"}
        </p>
        <div
          className="kit-roster__scroll"
          ref={listRef}
          {...(listHeight === undefined ? {} : { style: { height: listHeight } })}
        >
          {roster.players.length === 0 ? (
            <p>{t("kitRoster.empty")}</p>
          ) : (
            <ul aria-label={t("kitRoster.listLabel")} className="kit-roster__list">
              {roster.players.map((player) => (
                <li key={player}>
                  <span className="kit-roster__name">{player}</span>
                  <ConfirmButton
                    armedContent={<Icon name="trash" />}
                    armedLabel={t("kitRoster.removeConfirm", { name: player })}
                    className="icon-button--small"
                    idleLabel={t("kitRoster.remove", { name: player })}
                    idleVariant="danger"
                    onConfirm={() => roster.remove(player)}
                  >
                    <Icon name="trash" />
                  </ConfirmButton>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Dialog>
  );
}

/**
 * The button "Players" that opens the window to manage the saved players: add a name, delete a
 * name. It is shown in the main menu of every game and in the header of the GameHub, always with
 * its text because the symbol alone is not clear. Without a player list in the app it shows nothing.
 */
export function PlayerRosterButton() {
  const { t } = useTranslation();
  const roster = usePlayerRoster();
  const [open, setOpen] = useState(false);

  if (!roster) return null;

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Icon name="users" />
        {t("kitRoster.open")}
      </Button>
      <PlayerRosterDialog onClose={() => setOpen(false)} open={open} />
    </>
  );
}

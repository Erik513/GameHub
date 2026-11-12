import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { maxPlayerNameLength } from "../../business/shared/playerRoster";
import { Button, ConfirmButton, Dialog, Icon, StatusMessage } from "../components";
import { usePlayerRoster } from "./PlayerRosterContext";

type Problem = "empty" | "invalid" | "duplicate" | "full";

/**
 * The button "Players" that opens the window to manage the saved players: add a name, delete a
 * name. It is shown in the main menu of every game and in the header of the GameHub, always with
 * its text because the symbol alone is not clear. Without a player list in the app it shows nothing.
 */
export function PlayerRosterButton() {
  const { t } = useTranslation();
  const roster = usePlayerRoster();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [problem, setProblem] = useState<Problem>();

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
    setOpen(false);
    setProblem(undefined);
    setName("");
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        <Icon name="users" />
        {t("kitRoster.open")}
      </Button>
      <Dialog
        closeLabel={t("settings.close")}
        description={t("kitRoster.description")}
        onClose={close}
        open={open}
        title={t("kitRoster.title")}
      >
        <div className="kit-roster">
          <form className="kit-roster__add" noValidate onSubmit={submit}>
            <input
              aria-label={t("kitRoster.nameLabel")}
              autoComplete="off"
              className="field__input"
              maxLength={maxPlayerNameLength}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("kitRoster.namePlaceholder")}
              value={name}
            />
            <Button type="submit" variant="success">
              {t("kitRoster.add")}
            </Button>
          </form>
          {problem && (
            <StatusMessage title={t("kitRoster.title")} tone="error">
              {t(`kitRoster.problems.${problem}`)}
            </StatusMessage>
          )}
          {roster.players.length === 0 ? (
            <p>{t("kitRoster.empty")}</p>
          ) : (
            <ul aria-label={t("kitRoster.listLabel")} className="kit-roster__list">
              {roster.players.map((player) => (
                <li key={player}>
                  <span>{player}</span>
                  <ConfirmButton
                    armedContent={t("kitRoster.removeAgain")}
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
      </Dialog>
    </>
  );
}

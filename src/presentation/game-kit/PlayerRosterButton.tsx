import { useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { maxPlayerNameLength } from "../../business/shared/playerRoster";
import { Button, ConfirmButton, Dialog, Icon } from "../components";
import { GroupButtons } from "./GroupBox";
import { usePlayerRoster } from "./PlayerRosterContext";
import { useScrollbarWidth } from "./useScrollbarWidth";
import { useWholeRows } from "./useWholeRows";

type Problem = "empty" | "invalid" | "duplicate" | "full";

/** The lists of the large windows fill their (fixed) height with as many whole rows as fit. */
export const rosterRows = 99;

/**
 * A field with its add button and the line for a problem (the line is always there, so the window keeps
 * its size when a problem is shown). The line is above the field, or below it with `problemBelow`.
 */
function NameForm({
  label,
  onSubmit,
  placeholder,
  problemBelow = false,
  problemText,
}: {
  readonly label: string;
  /** Adds the name; returns the problem, or nothing when it worked. */
  readonly onSubmit: (name: string) => Problem | undefined;
  readonly placeholder: string;
  /** Puts the line for a problem below the field instead of above it. */
  readonly problemBelow?: boolean;
  /** The text of a problem. */
  readonly problemText: (problem: Problem) => string;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [problem, setProblem] = useState<Problem>();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = onSubmit(name);
    setProblem(result);
    if (!result) setName("");
  }

  const line = (
    <p className="kit-roster__problem" {...(problem ? { role: "alert" } : {})}>
      {problem ? problemText(problem) : " "}
    </p>
  );
  const form = (
    <form className="kit-roster__add" noValidate onSubmit={submit}>
      <input
        aria-invalid={problem ? true : undefined}
        aria-label={label}
        autoCapitalize="words"
        autoComplete="off"
        className="field__input"
        maxLength={maxPlayerNameLength}
        onChange={(event) => setName(event.target.value)}
        placeholder={placeholder}
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
  );

  return problemBelow ? (
    <>
      {form}
      {line}
    </>
  ) : (
    <>
      {line}
      {form}
    </>
  );
}

/**
 * The window to manage the saved players. There are only groups: the window lists them, "New group"
 * adds one, and a click on a group shows its players; names are added to a group there and removed from
 * it. Both views have the same build (a row, a row, a line of text, the list), so the window keeps its
 * size.
 */
export function PlayerRosterDialog({ onClose, open }: { onClose: () => void; open: boolean }) {
  const { t } = useTranslation();
  const roster = usePlayerRoster();
  const [naming, setNaming] = useState(false);
  // The group whose players are shown instead of the list of groups.
  const [openGroup, setOpenGroup] = useState<string>();
  // The list shows whole rows only: its height is calculated in whole rows.
  const listRef = useRef<HTMLDivElement>(null);
  const listHeight = useWholeRows(
    listRef,
    roster?.groups.length ?? 0,
    open,
    rosterRows,
    openGroup ?? "",
  );

  const scrollbarWidth = useScrollbarWidth(listRef, open, openGroup ?? "");

  if (!roster) return null;

  const shownGroup = roster.groups.find((candidate) => candidate.name === openGroup);

  function close() {
    onClose();
    setNaming(false);
    setOpenGroup(undefined);
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
        {shownGroup ? (
          <>
            <div className="kit-roster__add">
              <Button
                aria-label={t("kitRoster.groupBackTo", { name: shownGroup.name })}
                className="kit-roster__wide"
                onClick={() => setOpenGroup(undefined)}
                variant="secondary"
              >
                <Icon name="arrowLeft" />
                <span className="kit-roster__wide-text">{shownGroup.name}</span>
              </Button>
              <ConfirmButton
                armedContent={<Icon name="trash" />}
                armedLabel={t("kitRoster.groupRemoveConfirm", { name: shownGroup.name })}
                className="kit-roster__plus"
                idleLabel={t("kitRoster.groupRemove", { name: shownGroup.name })}
                idleVariant="danger"
                onConfirm={() => roster.removeGroup(shownGroup.name)}
              >
                <Icon name="trash" />
              </ConfirmButton>
            </div>
            {/* The player is added here, right below the way back (the list below scrolls). */}
            <NameForm
              label={t("kitRoster.nameLabel")}
              onSubmit={(name) => {
                const result = roster.addPlayerToGroup(shownGroup.name, name);
                return result.ok ? undefined : result.reason;
              }}
              placeholder={t("kitRoster.namePlaceholder")}
              problemBelow
              problemText={(problem) => t(`kitRoster.problems.${problem}`)}
            />
          </>
        ) : (
          <h3 className="kit-roster__heading">{t("kitRoster.groupsTitle")}</h3>
        )}
        <div
          className="kit-roster__scroll"
          ref={listRef}
          {...(listHeight === undefined && scrollbarWidth === undefined
            ? {}
            : {
                style: {
                  ...(listHeight === undefined ? {} : { height: listHeight }),
                  ...(scrollbarWidth === undefined
                    ? {}
                    : { "--roster-scrollbar": `${scrollbarWidth}px` }),
                },
              })}
        >
          {shownGroup ? (
            shownGroup.members.length === 0 ? (
              <p>{t("kitRoster.groupEmpty")}</p>
            ) : (
              <ul
                aria-label={t("kitRoster.groupMembers", { name: shownGroup.name })}
                className="kit-roster__list"
              >
                {shownGroup.members.map((player) => (
                  <li key={player}>
                    <span className="kit-roster__name">{player}</span>
                    <ConfirmButton
                      armedContent={<Icon name="trash" />}
                      armedLabel={t("kitRoster.removeConfirm", { name: player })}
                      className="icon-button--small"
                      idleLabel={t("kitRoster.remove", { name: player })}
                      idleVariant="danger"
                      onConfirm={() => roster.removePlayerFromGroup(shownGroup.name, player)}
                    >
                      <Icon name="trash" />
                    </ConfirmButton>
                  </li>
                ))}
              </ul>
            )
          ) : roster.groups.length === 0 ? (
            <p>{t("kitRoster.groupsEmpty")}</p>
          ) : (
            <GroupButtons
              groups={roster.groups.map((group) => ({
                count: String(group.members.length),
                key: group.name,
                title: group.name,
              }))}
              label={t("kitRoster.groupsTitle")}
              onOpen={setOpenGroup}
            />
          )}
        </div>
        {/* The bottom row of the list of groups: add a group. */}
        {shownGroup ? null : naming ? (
          <NameForm
            label={t("kitRoster.groupNameLabel")}
            onSubmit={(name) => {
              const result = roster.addGroup(name);
              if (!result.ok) return result.reason;
              setNaming(false);
              return undefined;
            }}
            placeholder={t("kitRoster.groupNamePlaceholder")}
            problemText={(problem) => t(`kitRoster.groupProblems.${problem}`)}
          />
        ) : (
          <>
            <p className="kit-roster__line">{" "}</p>
            <Button className="kit-roster__wide" onClick={() => setNaming(true)} variant="success">
              {t("kitRoster.groupAdd")}
            </Button>
          </>
        )}
      </div>
    </Dialog>
  );
}

/**
 * The button "Players" that opens the window to manage the saved groups and players. It is shown in
 * the main menu of every game and in the header of the GameHub, always with its text because the symbol
 * alone is not clear. Without a player list in the app it shows nothing.
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

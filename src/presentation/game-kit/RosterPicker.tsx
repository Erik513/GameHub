import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PlayerGroup } from "../../business/shared/playerGroups";
import { applyRosterSelection, rosterPlayersIn } from "../../business/shared/playerRoster";
import { parsePlayers } from "../../business/shared/players";
import { Button, Dialog, Icon } from "../components";
import { ActionRow } from "./ActionRow";
import { GroupButtons, PlayerChecklist } from "./GroupBox";
import { usePlayerRoster } from "./PlayerRosterContext";
import { PlayerRosterDialog, rosterRows } from "./PlayerRosterButton";
import { useScrollbarWidth } from "./useScrollbarWidth";
import { useWholeRows } from "./useWholeRows";

interface RosterPickerProps {
  /** Receives the new text of the players field when the choice is applied. */
  readonly onChange: (text: string) => void;
  /** The text of the players field as it is now. */
  readonly value: string;
  /** The most names the players field can hold; the window then allows no more ticks than that. */
  readonly limit?: number;
}

/**
 * The button "Choose from player list" and its window: the groups are listed, a tap on a group shows
 * its players to tick who plays today. Chosen players are added to the players field, deselected ones
 * are removed; names typed by hand stay.
 */
export function RosterPicker({ limit, onChange, value }: RosterPickerProps) {
  const { t } = useTranslation();
  const roster = usePlayerRoster();
  const [open, setOpen] = useState(false);
  // The saved players are managed in their own window, on top of this one.
  const [managing, setManaging] = useState(false);

  if (!roster) return null;

  const manageButton = (
    <Button onClick={() => setManaging(true)} variant="secondary">
      {t("kitRoster.manage")}
    </Button>
  );

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
        size="large"
        title={t("kitRoster.pickTitle")}
      >
        {roster.players.length > 0 ? (
          <PickerBody
            groups={roster.groups}
            {...(limit === undefined ? {} : { limit })}
            onManage={() => setManaging(true)}
            onApply={(text) => {
              onChange(text);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
            players={roster.players}
            value={value}
          />
        ) : (
          manageButton
        )}
      </Dialog>
      <PlayerRosterDialog onClose={() => setManaging(false)} open={managing} />
    </>
  );
}

/** The content of the window; it is created anew on every opening, so the choice starts fresh. */
function PickerBody({
  groups,
  limit,
  onApply,
  onCancel,
  onManage,
  players,
  value,
}: {
  readonly groups: readonly PlayerGroup[];
  readonly limit?: number;
  readonly onApply: (text: string) => void;
  readonly onCancel: () => void;
  /** Opens the window to manage the saved players (offered in the list of groups). */
  readonly onManage: () => void;
  readonly players: readonly string[];
  readonly value: string;
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<ReadonlySet<string>>(() =>
    rosterPlayersIn(value, players),
  );
  // The group whose players are shown instead of the list of groups.
  const [openGroup, setOpenGroup] = useState<string>();
  // The list shows whole rows only: its height is calculated in whole rows (the body only exists while
  // the window is open).
  const listRef = useRef<HTMLDivElement>(null);
  const listHeight = useWholeRows(listRef, players.length, true, rosterRows, openGroup ?? "");

  const scrollbarWidth = useScrollbarWidth(listRef, true, openGroup ?? "");

  if (players.length === 0) return null;

  // Names typed by hand stay, so they use up room of the limit; the rest is for the chosen players.
  const known = new Set(players.map((player) => player.toLocaleLowerCase()));
  const byHand = parsePlayers(value).filter((name) => !known.has(name.toLocaleLowerCase())).length;
  const capacity = limit === undefined ? Number.POSITIVE_INFINITY : Math.max(0, limit - byHand);
  const atLimit = selected.size >= capacity;
  const toggle = (name: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) {
      if (next.size >= capacity) return;
      next.add(name);
    } else next.delete(name);
    setSelected(next);
  };
  const count = (list: readonly string[]) =>
    `${list.filter((player) => selected.has(player)).length}/${list.length}`;
  const shown = groups.find((group) => group.name === openGroup);
  // "Choose all" and "Choose none" are offered inside a group and work on the players that are shown.
  const visible = shown ? shown.members : [];
  const allVisible = visible.length > 0 && visible.every((player) => selected.has(player));

  return (
    <>
      <div className="kit-roster kit-roster--pick">
        {/* Both views have the same build (buttons, a line of text, the list), so the window keeps its size. */}
        <div className="kit-roster__pair" data-pair={shown ? "true" : "false"}>
          {shown ? (
            <>
              <Button
                aria-label={t("kitRoster.groupBackTo", { name: shown.name })}
                className="kit-roster__wide"
                onClick={() => setOpenGroup(undefined)}
                variant="secondary"
              >
                <Icon name="arrowLeft" />
                <span className="kit-roster__wide-text">{shown.name}</span>
              </Button>
              <Button
                className="kit-roster__wide"
                disabled={visible.length === 0}
                onClick={() => {
                  const next = new Set(selected);
                  for (const player of visible) {
                    if (allVisible) next.delete(player);
                    else if (next.size < capacity) next.add(player);
                  }
                  setSelected(next);
                }}
                variant="secondary"
              >
                {t(allVisible ? "kitRoster.pickNone" : "kitRoster.pickAll")}
              </Button>
            </>
          ) : (
            <Button className="kit-roster__wide" onClick={onManage} variant="secondary">
              {t("kitRoster.manage")}
            </Button>
          )}
        </div>
        <h3 className="kit-roster__line">{shown ? shown.name : t("kitRoster.groupsTitle")}</h3>
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
          {shown ? (
            shown.members.length === 0 ? (
              <p>{t("kitRoster.groupEmpty")}</p>
            ) : (
              <PlayerChecklist
                isChecked={(player) => selected.has(player)}
                isDisabled={(player) => atLimit && !selected.has(player)}
                label={t("kitRoster.groupMembers", { name: shown.name })}
                onToggle={toggle}
                players={shown.members}
              />
            )
          ) : (
            <GroupButtons
              groups={groups.map((group) => ({
                count: count(group.members),
                key: group.name,
                title: group.name,
              }))}
              label={t("kitRoster.groupsTitle")}
              onOpen={setOpenGroup}
            />
          )}
        </div>
      </div>
      {/* The buttons are a footer: they stay at the bottom edge of the window, whatever the list above shows. */}
      <div className="kit-roster__footer">
        {/* The line is always there (empty until the limit is reached), so nothing moves when it appears. */}
        {limit !== undefined && (
          <p className="kit-roster__limit" role="status">
            {atLimit ? t("kitRoster.pickLimit", { count: limit }) : ""}
          </p>
        )}
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
    </>
  );
}

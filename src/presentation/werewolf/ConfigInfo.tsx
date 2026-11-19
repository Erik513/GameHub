import { useTranslation } from "react-i18next";
import type {
  FixedAddonId,
  FixedItemId,
  FixedLock,
} from "../../business/games/werewolf/fixedConfiguration";
import { InfoButton } from "../game-kit";

/** The entries that have an explanation. */
export type ConfigInfoId = FixedAddonId | FixedItemId | "seer" | "villagers" | "wolves";

interface ConfigInfoProps {
  /** The key below `werewolfConfig.info` that holds the explanation. */
  readonly id: ConfigInfoId;
  /** Why the choice is locked now (shown first, so the reason can always be read). */
  readonly lock?: FixedLock | "wolves" | null;
  /** The minimum number of players, for the reason of a lock. */
  readonly minimum?: number;
  readonly name: string;
  readonly className?: string;
}

/**
 * The "i" button of a role, an extra or a core value: a short explanation in a window of its own. It
 * stays reachable when the choice is locked, and then names the reason first. It never changes the
 * choice itself.
 */
export function ConfigInfo({ className, id, lock = null, minimum = 0, name }: ConfigInfoProps) {
  const { i18n, t } = useTranslation();
  // The window has three parts: what the role can do and what is special about it, the options (when it has
  // any) explained briefly, and the special notes (when there are any).
  const part = (name: "notes" | "options" | "what"): string => {
    const key = `werewolfConfig.info.${id}.${name}`;
    return i18n.exists(key) ? t(key as "werewolfConfig.info.hunter.what") : "";
  };
  const lines = (name: "notes" | "options") =>
    part(name)
      .split("\n")
      .filter((line) => line !== "");
  const options = lines("options");
  const notes = lines("notes");
  // Not enough players is shown by the box next to the name; the other reasons stand first in the text.
  const reason =
    lock === "noSeat"
      ? t("werewolfConfig.lockNoSeat")
      : lock === "combination"
        ? t("werewolfConfig.lockCombination")
        : lock === "wolves"
          ? t("werewolfConfig.lockWolves")
          : null;
  return (
    <InfoButton
      {...(className === undefined ? {} : { className })}
      closeLabel={t("werewolfConfig.infoClose")}
      label={t("werewolfConfig.infoLabel", { name })}
      text={
        <>
          {reason && <p className="ww-lock-reason">{reason}</p>}
          <p className="kit-info-text">{part("what")}</p>
          {options.length > 0 && (
            <>
              <h3 className="ww-info__heading">{t("werewolfConfig.infoOptions")}</h3>
              <ul className="kit-info-list">
                {options.map((line) => {
                  // An option is "Name: explanation".
                  const colon = line.indexOf(": ");
                  return (
                    <li key={line}>
                      {colon < 0 ? (
                        line
                      ) : (
                        <>
                          <strong>{line.slice(0, colon)}</strong>
                          {line.slice(colon)}
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          {notes.length > 0 && (
            <>
              <h3 className="ww-info__heading">{t("werewolfConfig.infoNotes")}</h3>
              <ul className="kit-info-list">
                {notes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </>
          )}
        </>
      }
      title={name}
      // From how many players the role can be taken: a green box while it can, a red one while it cannot.
      {...(minimum > 0
        ? {
            titleExtra: (
              <span
                className="ww-available"
                data-state={lock === "minimumPlayers" ? "locked" : "ok"}
              >
                {t("werewolfConfig.availableFrom", { count: minimum })}
              </span>
            ),
          }
        : {})}
    />
  );
}

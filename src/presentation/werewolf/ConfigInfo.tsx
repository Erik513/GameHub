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
  /** Only for the mayor: a second box says from how many players the hammer works, green while it does. */
  readonly hammerOk?: boolean;
}

/**
 * The "i" button of a role, an extra or a core value: a short explanation in a window of its own. It
 * stays reachable when the choice is locked, and then names the reason first. It never changes the
 * choice itself.
 */
export function ConfigInfo({
  className,
  hammerOk,
  id,
  lock = null,
  minimum = 0,
  name,
}: ConfigInfoProps) {
  const { i18n, t } = useTranslation();
  // The window has four parts, each only when there is something to say: the general information (team,
  // conditions), the tasks (what the role does and when), the options (when it has any) and the special notes.
  const part = (name: "general" | "notes" | "options" | "tasks"): readonly string[] => {
    const key = `werewolfConfig.info.${id}.${name}`;
    return i18n.exists(key)
      ? t(key as "werewolfConfig.info.hunter.general")
          .split("\n")
          .filter((line) => line !== "")
      : [];
  };
  const headings = {
    general: t("werewolfConfig.infoGeneral"),
    notes: t("werewolfConfig.infoNotes"),
    options: t("werewolfConfig.infoOptions"),
    tasks: t("werewolfConfig.infoTasks"),
  };
  // Not enough players is shown by the box next to the name; the other reasons stand first in the text.
  const reason =
    lock === "noSeat"
      ? t("werewolfConfig.lockNoSeat")
      : lock === "combination"
        ? // The witch and the magician are too strong together; every other combination stays general.
          id === "witch" || id === "magician"
          ? t("werewolfConfig.lockCombinationWith", {
              role: t(`werewolfConfig.items.${id === "witch" ? "magician" : "witch"}`),
            })
          : t("werewolfConfig.lockCombination")
        : null;
  return (
    <InfoButton
      {...(className === undefined ? {} : { className })}
      closeLabel={t("werewolfConfig.infoClose")}
      label={t("werewolfConfig.infoLabel", { name })}
      text={
        <>
          {reason && <p className="ww-lock-reason">{reason}</p>}
          {(["general", "tasks", "options", "notes"] as const).map((name) => {
            const lines = part(name);
            if (lines.length === 0) return null;
            return (
              <section className="ww-info__part" key={name}>
                <h3 className="ww-info__heading">{headings[name]}</h3>
                <ul className="kit-info-list">
                  {lines.map((line) => {
                    // An option is "Name: explanation"; a note ending with a colon introduces the lines below.
                    const colon = name === "options" ? line.indexOf(": ") : -1;
                    const lead = name === "notes" && line.endsWith(":");
                    return (
                      <li className={lead ? "ww-info__lead" : undefined} key={line}>
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
              </section>
            );
          })}
        </>
      }
      title={name}
      // From how many players the role can be taken: a green box while it can, a red one while it cannot.
      {...(minimum > 0
        ? {
            titleExtra: (
              <>
                <span
                  className="ww-available"
                  data-state={lock === "minimumPlayers" ? "locked" : "ok"}
                >
                  {t("werewolfConfig.availableFrom", { count: minimum })}
                </span>
                {hammerOk !== undefined && (
                  <span className="ww-available" data-state={hammerOk ? "ok" : "locked"}>
                    {t("werewolfConfig.hammerFrom", { count: 10 })}
                  </span>
                )}
              </>
            ),
          }
        : {})}
    />
  );
}

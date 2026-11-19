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
  const { t } = useTranslation();
  const lines = t(`werewolfConfig.info.${id}`).split("\n");
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
          <ul className="kit-info-list">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
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

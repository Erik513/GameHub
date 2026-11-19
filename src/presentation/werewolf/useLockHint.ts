import { useTranslation } from "react-i18next";
import type { FixedItemView } from "../../business/games/werewolf/fixedConfiguration";

/** The short note under a locked tile: why it cannot be chosen now. */
export function useLockHint() {
  const { t } = useTranslation();
  return (lock: FixedItemView["lock"] | "wolves", minimum: number) =>
    lock === "minimumPlayers"
      ? t("werewolfConfig.lockedMinimum", { count: minimum })
      : lock === "noSeat"
        ? t("werewolfConfig.lockedNoSeat")
        : lock === "combination"
          ? t("werewolfConfig.lockedCombination")
          : lock === "wolves"
            ? t("werewolfConfig.lockedWolves")
            : undefined;
}

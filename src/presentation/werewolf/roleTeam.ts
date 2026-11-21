import type { TFunction } from "i18next";
import type { ConfigInfoId } from "./ConfigInfo";

/** The line under the name of a role: whose side it is on (the witch and the magician exclude each other). */
export function teamOf(id: ConfigInfoId, t: TFunction): string {
  const teamKey =
    id === "wolves"
      ? "teamWolves"
      : id === "tanner"
        ? "teamOwnGoal"
        : id === "amulet" || id === "drunk"
          ? "teamExtra"
          : "teamVillage";
  return t(`werewolfConfig.${teamKey}`);
}

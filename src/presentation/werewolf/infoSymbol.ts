import type { ConfigInfoId } from "./ConfigInfo";
import type { SymbolId } from "./symbols/catalog";

/** The symbol of a role, an extra or a core value of the configuration (the alternative guard shows the bodyguard). */
export function symbolOfInfo(id: ConfigInfoId): SymbolId {
  switch (id) {
    case "guard":
      return "bodyguard";
    case "villagers":
      return "villager";
    case "wolves":
      return "wolf";
    default:
      return id;
  }
}

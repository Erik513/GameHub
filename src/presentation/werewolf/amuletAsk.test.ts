import { expect, it } from "vitest";
import { createGuide, describeGuide } from "../../business/games/werewolf/narratorGuide";
import { createWerewolfSession } from "../../business/games/werewolf/session";
import { createWerewolf, type WerewolfState } from "../../business/games/werewolf/stateMachine";
import { createGameHubI18n } from "../../i18n";
import { askText } from "./stepText";

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

async function askOf(mustPass: boolean, language: "en" | "de") {
  const i18n = await createGameHubI18n(language);
  const base = createWerewolf(names, "Max", () => 0.3, [], { amulet: true, wolfCount: 2 })!;
  const state = {
    ...base,
    status: "amuletPass",
    amulet: { holder: base.amulet!.holder, mustPass },
  } as unknown as WerewolfState;
  return askText(describeGuide(createGuide(createWerewolfSession(state))), i18n.t);
}

it("asks the holder of the amulet to keep it (thumb) or to pass it on (point), like the magician", async () => {
  expect(await askOf(false, "en")).toBe("Keep the amulet ([thumb]) or[br]pass it on (point)?");
  expect(await askOf(false, "de")).toBe("Amulett behalten ([thumb]) oder[br]weitergeben (zeigen)?");
});

it("only asks to pass the amulet on when it stopped an attack and has to be passed", async () => {
  expect(await askOf(true, "en")).toBe("Pass on the amulet (point)");
  expect(await askOf(true, "de")).toBe("Amulett weitergeben (zeigen)");
});

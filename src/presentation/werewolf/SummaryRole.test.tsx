import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import {
  chooseAbility,
  choosePlayer,
  continueGuide,
  createGuide,
  describeGuide,
} from "../../business/games/werewolf/narratorGuide";
import { createWerewolfSession } from "../../business/games/werewolf/session";
import { createWerewolf, type WerewolfState } from "../../business/games/werewolf/stateMachine";
import { createGameHubI18n } from "../../i18n";
import { Summary } from "./GuideSummary";

/** The blue summary names the true role of a chosen person in brackets, the drunk who does not know it with both. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

async function summaryOfAttack(language: "en" | "de", revealed: boolean) {
  const base = createWerewolf(names, "Max", () => 0.3, ["hunter"], {
    attackOnFirstNight: true,
    drunk: true,
    wolfCount: 2,
  })!;
  const target = base.players.find((player) => player.role === "hunter")!;
  const state = {
    ...base,
    drunk: { player: target.name, revealed },
    status: "wolves",
  } as unknown as WerewolfState;
  let guide = continueGuide(createGuide(createWerewolfSession(state)));
  guide = choosePlayer(chooseAbility(guide, "attack"), target.name);
  const i18n = await createGameHubI18n(language);
  const { container } = render(
    <I18nextProvider i18n={i18n}>
      <Summary view={describeGuide(guide)} />
    </I18nextProvider>,
  );
  return { name: target.name, text: container.textContent };
}

it("names the role of a chosen person in brackets", async () => {
  const { name, text } = await summaryOfAttack("en", true);
  expect(text).toContain(`${name} (Hunter)`);
});

it("names both for the drunk who does not know his role yet, in both languages", async () => {
  const english = await summaryOfAttack("en", false);
  expect(english.text).toContain(`${english.name} (Drunk, true role: Hunter)`);
  document.body.innerHTML = "";
  const german = await summaryOfAttack("de", false);
  expect(german.text).toContain(`${german.name} (Trunkenbold, wahre Rolle: Jäger)`);
});

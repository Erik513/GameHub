import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { createWerewolfSession } from "../../business/games/werewolf/session";
import { createWerewolf, type WerewolfState } from "../../business/games/werewolf/stateMachine";
import { createGameHubI18n } from "../../i18n";
import { NarratorHarness } from "./narratorTestKit";

/** Passing the amulet: the holder passes it on (used up as soon as decided) or, when he may, keeps it. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

function amuletStep(mustPass: boolean) {
  const base = createWerewolf(names, "Max", () => 0.3, [], {
    amulet: true,
    attackOnFirstNight: true,
    wolfCount: 2,
  })!;
  const holder = base.players.find((player) => player.role === "villager")!.name;
  const state = {
    ...base,
    amulet: { holder, mustPass },
    night: 2,
    poisoned: null,
    status: "amuletPass",
    victim: null,
  } as unknown as WerewolfState;
  return createWerewolfSession(state);
}

async function open(mustPass: boolean) {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <NarratorHarness start={() => amuletStep(mustPass)} />
    </I18nextProvider>,
  );
  fireEvent.click(document.querySelector(".ww-script__wake")!);
}

const pass = () => document.querySelector<HTMLButtonElement>(".ww-ability:not(.ww-ability--skip)")!;
const keep = () => document.querySelector<HTMLButtonElement>(".ww-ability--skip");

it("shows passing the amulet as used up as soon as the recipient is decided, and keeps the keep button, switched off", async () => {
  await open(false);
  expect(pass()).toHaveAttribute("data-state", "ready");
  expect(keep()).not.toBeNull();
  expect(keep()).toBeEnabled();
  fireEvent.click(pass());
  fireEvent.click(document.querySelector<HTMLElement>(".ww-person:not(:disabled)")!);
  fireEvent.click(screen.getByRole("button", { name: "Confirm the choice" }));
  // Decided: passing is used up (grey, struck through); the button "keep" stays where it was, darkened, no frame.
  expect(pass()).toHaveAttribute("data-state", "used");
  expect(keep()).toBeDisabled();
  expect(keep()).not.toHaveAttribute("data-next");
});

it("has no keep button when the holder has to pass the amulet on", async () => {
  await open(true);
  expect(pass()).toBeEnabled();
  expect(keep()).toBeNull();
});

it("puts the button to keep the amulet first (green, left) and passing it on after it (red, right)", async () => {
  await open(false);
  const row = document.querySelector(".ww-role-card__abilities")!;
  expect(row).toHaveAttribute("data-keep-first", "true");
  const buttons = [...row.querySelectorAll(".ww-ability")];
  expect(buttons[0]).toBe(keep());
  expect(buttons[1]).toBe(pass());
});

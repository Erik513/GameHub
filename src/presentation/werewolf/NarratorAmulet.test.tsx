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

it("shows the keep button switched off when the holder has to pass the amulet on", async () => {
  await open(true);
  expect(pass()).toBeEnabled();
  expect(keep()).not.toBeNull();
  expect(keep()).toBeDisabled();
});

const next = () => screen.getByRole("button", { name: /^(Next|End the night)$/ });
const touchBox = () =>
  [...document.querySelectorAll(".ww-script__step")].find((step) =>
    (step.textContent ?? "").startsWith("Tap "),
  );

it("lets the narrator touch the new holder after the holder fell asleep, before next", async () => {
  await open(false);
  fireEvent.click(pass());
  const person = document.querySelector<HTMLElement>(".ww-person:not(:disabled)")!;
  const name = person.textContent?.trim() ?? "";
  fireEvent.click(person);
  fireEvent.click(screen.getByRole("button", { name: "Confirm the choice" }));
  // Asleep: the last box says whom to touch; "next" waits for its check.
  expect(touchBox()).toHaveTextContent(`Tap ${name} discreetly`);
  expect(touchBox()).toHaveAttribute("data-state", "active");
  expect(next()).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Task done" }));
  expect(touchBox()).toHaveAttribute("data-state", "done");
  expect(next()).toBeEnabled();
});

it("keeps the box of touching when the amulet is kept: the narrator touches nobody", async () => {
  await open(false);
  fireEvent.click(keep()!);
  expect(touchBox()).toHaveTextContent("Tap nobody");
  expect(next()).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Task done" }));
  expect(next()).toBeEnabled();
});

it("puts the button to keep the amulet first (green, left) and passing it on after it (red, right)", async () => {
  await open(false);
  const row = document.querySelector(".ww-role-card__abilities")!;
  expect(row).toHaveAttribute("data-keep-first", "true");
  const buttons = [...row.querySelectorAll(".ww-ability")];
  expect(buttons[0]).toBe(keep());
  expect(buttons[1]).toBe(pass());
});

it("names the holder of the amulet in the upper box, with the name and the own role of the person below", async () => {
  await open(false);
  const card = document.querySelector(".ww-role-card")!;
  expect(card).toHaveAttribute("aria-label", "Amulet holder");
  expect(card.querySelector(".ww-role-card__role [data-symbol]")).toHaveAttribute(
    "data-symbol",
    "amulet",
  );
  expect(card.querySelector(".ww-role-card__who small")).toHaveTextContent(/^P\d+ \(Villager\)$/);
});

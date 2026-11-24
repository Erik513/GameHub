import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { eventChoices } from "../../business/games/werewolf/eventChoices";
import {
  advanceWerewolfSession,
  createWerewolfSession,
  type WerewolfSession,
} from "../../business/games/werewolf/session";
import { createWerewolf } from "../../business/games/werewolf/stateMachine";
import { createGameHubI18n } from "../../i18n";
import { NarratorHarness } from "./narratorTestKit";

/** The seer: the whole script is there from the start, and once a person is chosen the ability is decided. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

function toSeer(
  status: "seer" | "investigator" = "seer",
  roles: readonly "paranormalInvestigator"[] = [],
): WerewolfSession {
  let session = createWerewolfSession(
    createWerewolf(names, "Max", () => 0.3, roles, { attackOnFirstNight: true, wolfCount: 2 })!,
  );
  for (let step = 0; step < 100 && session.present.status !== status; step++) {
    const events = eventChoices(session.present).filter(
      (event) => !(event.type === "attack" && event.target === null),
    );
    session = advanceWerewolfSession(session, events[0]!);
  }
  return session;
}

const boxes = () =>
  [...document.querySelectorAll(".ww-script__step")].map((box) => box.textContent);

async function open() {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <NarratorHarness start={toSeer} />
    </I18nextProvider>,
  );
  fireEvent.click(document.querySelector(".ww-script__wake")!);
}

it("shows the whole script of the seer from the start, the box of the result included", async () => {
  await open();
  const before = boxes();
  // Waking up, choosing a person, showing the result with the thumb, going to sleep.
  expect(before).toHaveLength(4);
  expect(before[2]).toMatch(/thumb/i);
  // After the choice no new box appears: the script stays the same.
  fireEvent.click(screen.getByRole("button", { name: /^Look/ }));
  fireEvent.click(document.querySelector<HTMLElement>(".ww-person:not(:disabled)")!);
  fireEvent.click(screen.getByRole("button", { name: "Confirm the choice" }));
  expect(boxes()).toEqual(before);
});

it("shows the box of the result for the investigator only when he uses the ability, not when he skips", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <NarratorHarness start={() => toSeer("investigator", ["paranormalInvestigator"])} />
    </I18nextProvider>,
  );
  fireEvent.click(document.querySelector(".ww-script__wake")!);
  fireEvent.click(document.querySelector(".ww-ability--skip")!);
  const states = [...document.querySelectorAll(".ww-script__step")].map((box) =>
    box.getAttribute("data-state"),
  );
  // Waking up and the decision (skip) are done, going to sleep is next: there is no box for a result that is not shown.
  expect(states).toEqual(["done", "done", "active"]);
  // The summary of a skip says the same as for the drunk who is only a cover (see NarratorCover.test.tsx).
  expect(document.querySelector(".ww-guide__chosen")?.textContent).toBe(
    "Nothing chosen – the role passes",
  );
});

it("shows the box of the result for the investigator once he has used the ability", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <NarratorHarness start={() => toSeer("investigator", ["paranormalInvestigator"])} />
    </I18nextProvider>,
  );
  fireEvent.click(document.querySelector(".ww-script__wake")!);
  expect(boxes()).toHaveLength(3);
  fireEvent.click(screen.getByRole("button", { name: /^Check/ }));
  fireEvent.click(document.querySelector<HTMLElement>(".ww-person:not(:disabled)")!);
  fireEvent.click(screen.getByRole("button", { name: "Confirm the choice" }));
  // The ability was used: now the result is shown with the thumb, so its box is there.
  expect(boxes()).toHaveLength(4);
  expect(boxes()[2]).toMatch(/thumb/i);
  // The skip button stays where it was, switched off (the controls do not jump), without the frame.
  const skip = document.querySelector<HTMLButtonElement>(".ww-ability--skip")!;
  expect(skip).not.toBeNull();
  expect(skip).toBeDisabled();
  expect(skip).not.toHaveAttribute("data-next");
});

it("darkens the skip button of the investigator while he chooses a person, and gives it no frame", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <NarratorHarness start={() => toSeer("investigator", ["paranormalInvestigator"])} />
    </I18nextProvider>,
  );
  fireEvent.click(document.querySelector(".ww-script__wake")!);
  const skip = () => document.querySelector<HTMLButtonElement>(".ww-ability--skip")!;
  // Nothing chosen yet: "skip" is an option to press, with the frame.
  expect(skip()).toBeEnabled();
  expect(skip()).toHaveAttribute("data-next");
  fireEvent.click(screen.getByRole("button", { name: /^Check/ }));
  fireEvent.click(document.querySelector<HTMLElement>(".ww-person:not(:disabled)")!);
  // A person is chosen: "skip" does not apply any more, it is darkened and has no frame.
  expect(skip()).toBeDisabled();
  expect(skip()).toHaveAttribute("data-state", "dim");
  expect(skip()).not.toHaveAttribute("data-next");
});

it("decides the ability with the choice: it cannot be pressed again until the choice is taken back", async () => {
  await open();
  const look = () => screen.getByRole("button", { name: /^Look/ });
  fireEvent.click(look());
  fireEvent.click(document.querySelector<HTMLElement>(".ww-person:not(:disabled)")!);
  fireEvent.click(screen.getByRole("button", { name: "Confirm the choice" }));
  // The result is shown: the ability is marked as used for this step and cannot be pressed.
  expect(look()).toBeDisabled();
  expect(look()).toHaveAttribute("aria-pressed", "true");
  // The undo button of the first box takes the choice back: the ability can be used again.
  const undo = document.querySelector<HTMLButtonElement>(
    ".ww-script__undo:not(.ww-script__check)",
  )!;
  expect(undo).toBeEnabled();
  fireEvent.click(undo);
  expect(look()).toBeEnabled();
});

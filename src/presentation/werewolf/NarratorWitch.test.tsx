import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
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
import { NarratorView } from "./NarratorView";

/**
 * The screen of the witch: the narrator asks two questions, always both (save the victim, poison somebody). The question
 * stands in a blue frame in the lower box, the buttons that answer it in the upper box; an ability that cannot be used is
 * asked as well and gets a thinner frame.
 */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

function toWitch(attackOnFirstNight: boolean): WerewolfSession {
  let word = 3;
  const random = () => {
    word = (Math.imul(word, 1664525) + 1013904223) >>> 0;
    return word / 2 ** 32;
  };
  let session = createWerewolfSession(
    createWerewolf(names, "Max", random, ["witch"], { attackOnFirstNight, wolfCount: 2 })!,
  );
  for (let step = 0; step < 100 && session.present.status !== "witch"; step++) {
    const events = eventChoices(session.present).filter(
      (event) => !(event.type === "attack" && event.target === null),
    );
    session = advanceWerewolfSession(session, events[0]!);
  }
  return session;
}

function Harness({ attack }: { readonly attack: boolean }) {
  const [session, setSession] = useState<WerewolfSession>(() => toWitch(attack));
  return (
    <NarratorView
      onEnd={() => undefined}
      onRules={() => undefined}
      onSession={setSession}
      session={session}
    />
  );
}

const abilityButtons = () => [...document.querySelectorAll<HTMLButtonElement>(".ww-ability")];
const steps = () => [...document.querySelectorAll<HTMLElement>(".ww-script__step")];
const state = (index: number) => steps()[index]?.getAttribute("data-state");

async function open(attack: boolean) {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <Harness attack={attack} />
    </I18nextProvider>,
  );
  fireEvent.click(document.querySelector(".ww-guide--tap")!);
}

it("shows all options above at all times and the two questions as boxes below, the open one in blue", async () => {
  await open(true);
  // Above: Heal, Poison and Skip stay visible; in the first question Heal and Skip are framed, Poison waits.
  const names = () => abilityButtons().map((button) => button.textContent);
  expect(names()).toEqual(["Heal", "Poison", "Skip"]);
  const [heal, poison, skip] = abilityButtons();
  expect(heal).toHaveAttribute("data-next");
  expect(skip).toHaveAttribute("data-next");
  expect(poison).not.toHaveAttribute("data-next");
  expect(poison).toBeDisabled();
  // Below: two boxes, the first one is open; the hint with the victim stands below with its own border.
  // The first box holds two tasks as a list (show the victim, ask), the second one task.
  expect(
    steps().map((step) =>
      [...step.querySelectorAll(".ww-script__item")].map((item) => item.textContent),
    ),
  ).toEqual([
    [expect.stringMatching(/^Show the victim: P\d+$/), "Does the witch want to save the victim?"],
    ["Does the witch want to poison somebody? Then she points at a person."],
  ]);
  expect([state(0), state(1)]).toEqual(["active", "pending"]);
  expect(document.querySelector(".ww-guide__victim")?.textContent).toMatch(/attacked/);
  // "Heal" answers the first question with yes; the second box opens, all options are still there.
  fireEvent.click(heal!);
  expect(names()).toEqual(["Heal", "Poison", "Skip"]);
  expect([state(0), state(1)]).toEqual(["done", "active"]);
  expect(abilityButtons()[1]).toHaveAttribute("data-next");
  expect(abilityButtons()[0]).not.toHaveAttribute("data-next");
  // "Poison" opens the list of people; a person and the check mark finish the step.
  fireEvent.click(abilityButtons()[1]!);
  fireEvent.click(document.querySelector(".ww-person")!);
  fireEvent.click(screen.getByRole("button", { name: "Confirm the choice" }));
  expect(screen.getByText(/Chosen: .*Healed.*Poisoned/)).toBeInTheDocument();
  // After the decision the hint stays (yellow border) and the blue summary stands below it, at the very bottom.
  const footer = document.querySelector(".ww-guide__extra")!;
  const children = [...footer.children].map((child) => child.className);
  expect(children[0]).toContain("ww-guide__victim");
  expect(children.at(-1)).toContain("ww-guide__chosen");
});

it("answers both questions with skip: nothing is used and the step is finished with two taps", async () => {
  await open(true);
  fireEvent.click(abilityButtons()[2]!);
  expect([state(0), state(1)]).toEqual(["done", "active"]);
  fireEvent.click(abilityButtons()[2]!);
  expect(screen.getByText(/Nothing chosen/)).toBeInTheDocument();
});

it("asks about the healing potion although nobody was attacked: the hint says why the potion cannot be used, skip answers", async () => {
  await open(false);
  const [heal, , skip] = abilityButtons();
  // The potion cannot be used: it is disabled but carries the thinner blue frame, because the question is asked anyway.
  expect(heal).toBeDisabled();
  expect(heal).toHaveAttribute("data-next", "thin");
  expect(skip).toBeEnabled();
  expect(skip).toHaveAttribute("data-next");
  // The reason stands below as a hint with its own (yellow) border.
  expect(document.querySelector(".ww-guide__victim")?.textContent).toMatch(/attacked nobody/);
  expect(steps()[0]!.querySelector(".ww-script__item")?.textContent).toBe(
    "Show the victim: no victim",
  );
  fireEvent.click(skip!);
  expect([state(0), state(1)]).toEqual(["done", "active"]);
});

it("has an undo button right of every box with a decision, as high as the box; the blue summary only sums up", async () => {
  await open(true);
  // The undo buttons are always there (nothing moves): switched off while nothing is decided.
  for (const button of screen.getAllByRole("button", { name: "Undo" }))
    expect(button).toBeDisabled();
  fireEvent.click(abilityButtons()[0]!);
  // The first question is answered: its undo button is on, the one of the open second box stays off.
  expect(
    screen
      .getAllByRole("button", { name: "Undo" })
      .map((button) => (button as HTMLButtonElement).disabled),
  ).toEqual([false, true]);
  fireEvent.click(abilityButtons()[1]!);
  fireEvent.click(document.querySelector(".ww-person")!);
  fireEvent.click(screen.getByRole("button", { name: "Confirm the choice" }));
  expect(screen.getByText(/Chosen: .*Healed.*Poisoned/)).toBeInTheDocument();
  // The box that says the witch sleeps again stands below the script, in the blue frame; the summary has no button.
  const stack = document.querySelector(".ww-guide__head .ww-script")!;
  expect(stack.lastElementChild?.getAttribute("data-state")).toBe("active");
  expect(stack.lastElementChild?.textContent).toMatch(/schläft wieder ein|goes back to sleep/);
  // Both boxes of the script have an undo button, in a row with the box.
  expect(document.querySelector(".ww-guide__chosen button")).toBeNull();
  const rows = [...document.querySelectorAll(".ww-script > .ww-script__row")];
  expect(rows).toHaveLength(2);
  for (const row of rows) {
    expect(row.querySelector(".ww-script__step")).not.toBeNull();
    expect(row.querySelector(".ww-script__undo")).not.toBeNull();
  }
  // The undo of the second box asks the poison question again, the answer to the first question stays.
  fireEvent.click(rows[1]!.querySelector(".ww-script__undo")!);
  expect([state(0), state(1)]).toEqual(["done", "active"]);
  expect(abilityButtons()[1]).toHaveAttribute("data-next");
  // The undo of the first box asks the first question again.
  fireEvent.click(screen.getAllByRole("button", { name: "Undo" })[0]!);
  expect([state(0), state(1)]).toEqual(["active", "pending"]);
  expect(abilityButtons()[0]).toHaveAttribute("data-next");
});

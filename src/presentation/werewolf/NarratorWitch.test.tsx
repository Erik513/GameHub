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
const question = () => document.querySelector(".ww-guide__text");

async function open(attack: boolean) {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <Harness attack={attack} />
    </I18nextProvider>,
  );
  fireEvent.click(document.querySelector(".ww-guide--tap")!);
}

it("asks both questions one after the other, each with its own pair of buttons in blue frames", async () => {
  await open(true);
  // First question: the victim; the heading stands in a frame; the buttons are "Heal" and "Skip", both framed.
  expect(question()?.textContent).toMatch(/Victim of the wolves: .*save/);
  expect(question()).toHaveAttribute("data-next");
  expect(abilityButtons().map((button) => button.textContent)).toEqual(["Heal", "Skip"]);
  for (const button of abilityButtons()) expect(button).toHaveAttribute("data-next");
  // "Heal" answers the question with yes and goes on to the second one.
  fireEvent.click(abilityButtons()[0]!);
  expect(question()?.textContent).toMatch(/poison somebody/);
  expect(abilityButtons().map((button) => button.textContent)).toEqual(["Poison", "Skip"]);
  for (const button of abilityButtons()) expect(button).toHaveAttribute("data-next");
  // "Poison" opens the list of people; a person and the check mark finish the step.
  fireEvent.click(abilityButtons()[0]!);
  fireEvent.click(document.querySelector(".ww-person")!);
  fireEvent.click(screen.getByRole("button", { name: "Confirm the choice" }));
  expect(screen.getByText(/Chosen: .*Healed.*Poisoned/)).toBeInTheDocument();
});

it("answers both questions with skip: nothing is used and the step is finished with two taps", async () => {
  await open(true);
  fireEvent.click(abilityButtons()[1]!);
  expect(question()?.textContent).toMatch(/poison somebody/);
  fireEvent.click(abilityButtons()[1]!);
  expect(screen.getByText(/Nothing chosen/)).toBeInTheDocument();
});

it("asks about the healing potion although nobody was attacked: the potion has a thin frame and cannot be used, skip answers", async () => {
  await open(false);
  expect(question()?.textContent).toMatch(/No victim tonight/);
  const [heal, skip] = abilityButtons();
  expect(heal).toBeDisabled();
  expect(heal).toHaveAttribute("data-next", "thin");
  expect(skip).toBeEnabled();
  expect(skip).toHaveAttribute("data-next");
  fireEvent.click(skip!);
  expect(question()?.textContent).toMatch(/poison somebody/);
});

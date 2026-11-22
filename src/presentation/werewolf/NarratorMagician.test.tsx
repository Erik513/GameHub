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

/** The screen of the magician: both spells can be used in one night, and the 2 goes only after a confirmed choice. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

function toMagician(): WerewolfSession {
  let word = 3;
  const random = () => {
    word = (Math.imul(word, 1664525) + 1013904223) >>> 0;
    return word / 2 ** 32;
  };
  let session = createWerewolfSession(
    createWerewolf(names, "Max", random, ["magician"], { attackOnFirstNight: true, wolfCount: 2 })!,
  );
  for (let step = 0; step < 100 && session.present.status !== "magician"; step++) {
    const events = eventChoices(session.present).filter(
      (event) => !(event.type === "attack" && event.target === null),
    );
    session = advanceWerewolfSession(session, events[0]!);
  }
  return session;
}

function Harness() {
  const [session, setSession] = useState<WerewolfSession>(toMagician);
  return (
    <NarratorView
      onEnd={() => undefined}
      onRules={() => undefined}
      onSession={setSession}
      session={session}
    />
  );
}

const counts = () => document.querySelectorAll(".ww-ability__count").length;
const persons = () => [...document.querySelectorAll<HTMLElement>(".ww-person")];

it("lets the magician use a spell twice and both spells in one night; the 2 goes only once a choice is confirmed", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <Harness />
    </I18nextProvider>,
  );
  fireEvent.click(document.querySelector(".ww-guide--tap")!);
  // Both spells are there: a 2 on both buttons.
  expect(counts()).toBe(2);
  // Kill: the list opens, one person is chosen: the 2 stays until the choice is confirmed.
  fireEvent.click(screen.getByRole("button", { name: /^Kill/ }));
  fireEvent.click(persons()[0]!);
  expect(counts()).toBe(2);
  // The check mark confirms the choice: the 2 is gone on both buttons, both spells are still usable.
  fireEvent.click(screen.getByRole("button", { name: "Confirm the choice" }));
  expect(counts()).toBe(0);
  const kill = screen.getByRole("button", { name: /^Kill/ });
  const heal = screen.getByRole("button", { name: /^Heal/ });
  expect(kill).toBeEnabled();
  expect(heal).toBeEnabled();
  // The same spell a second time: the first person stays chosen, a second one is added.
  fireEvent.click(kill);
  expect(document.querySelectorAll(".ww-person[aria-pressed='true']")).toHaveLength(1);
  fireEvent.click(persons().find((person) => person.getAttribute("aria-pressed") !== "true")!);
  expect(document.querySelectorAll(".ww-person[aria-pressed='true']")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Confirm the choice" }));
  // Both spells are used: the healing spell cannot be chosen any more, the step is confirmed with "done".
  expect(heal).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  expect(document.querySelector(".ww-guide__chosen")?.textContent).toMatch(/Killed: P\d+, P\d+/);
});

it("lets the magician heal and kill in the same night", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <Harness />
    </I18nextProvider>,
  );
  fireEvent.click(document.querySelector(".ww-guide--tap")!);
  fireEvent.click(screen.getByRole("button", { name: /^Heal/ }));
  fireEvent.click(screen.getByRole("button", { name: /^Kill/ }));
  fireEvent.click(persons()[0]!);
  fireEvent.click(screen.getByRole("button", { name: "Confirm the choice" }));
  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  expect(document.querySelector(".ww-guide__chosen")?.textContent).toMatch(
    /Healed: P\d+Killed: P\d+/,
  );
});

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

/** The list of people: every player is always there; the ones that cannot be chosen are disabled, not missing. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

function toBodyguard(): WerewolfSession {
  let word = 3;
  const random = () => {
    word = (Math.imul(word, 1664525) + 1013904223) >>> 0;
    return word / 2 ** 32;
  };
  let session = createWerewolfSession(
    createWerewolf(names, "Max", random, ["bodyguard"], {
      attackOnFirstNight: true,
      wolfCount: 2,
    })!,
  );
  for (let step = 0; step < 100 && session.present.status !== "bodyguard"; step++) {
    const events = eventChoices(session.present).filter(
      (event) => !(event.type === "attack" && event.target === null),
    );
    session = advanceWerewolfSession(session, events[0]!);
  }
  return session;
}

function Harness() {
  return <NarratorHarness start={toBodyguard} />;
}

it("lists all players in the same order, with the ones the role may not choose disabled and framed", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <Harness />
    </I18nextProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: /^Begin$/ }));
  fireEvent.click(document.querySelector(".ww-script__wake")!);
  fireEvent.click(screen.getByRole("button", { name: /^Protect/ }));
  const people = () => [...document.querySelectorAll<HTMLButtonElement>(".ww-person")];
  // All twelve are there; the bodyguard himself cannot be chosen.
  expect(people()).toHaveLength(12);
  const blocked = people().filter((person) => person.dataset.state === "blocked");
  expect(blocked.length).toBeGreaterThan(0);
  for (const person of blocked) expect(person).toBeDisabled();
  const order = people().map((person) => person.title);
  expect(order).toEqual([...order].sort((a, b) => a.localeCompare(b)));
  // Choosing someone does not move or remove any button.
  fireEvent.click(people().find((person) => !person.disabled)!);
  expect(people().map((person) => person.title)).toEqual(order);
});

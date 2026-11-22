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

/** The script of Cupid and of the lovers: the tasks of the narrator as a list, the choice of the two people, the summary. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

function toCupid(): WerewolfSession {
  let word = 3;
  const random = () => {
    word = (Math.imul(word, 1664525) + 1013904223) >>> 0;
    return word / 2 ** 32;
  };
  let session = createWerewolfSession(
    createWerewolf(names, "Max", random, ["cupid"], { attackOnFirstNight: true, wolfCount: 2 })!,
  );
  for (let step = 0; step < 100 && session.present.status !== "cupid"; step++) {
    const events = eventChoices(session.present);
    session = advanceWerewolfSession(session, events[0]!);
  }
  return session;
}

function Harness() {
  const [session, setSession] = useState<WerewolfSession>(toCupid);
  return (
    <NarratorView
      onEnd={() => undefined}
      onRules={() => undefined}
      onSession={setSession}
      session={session}
    />
  );
}

const boxes = () =>
  [...document.querySelectorAll(".ww-guide__head .ww-script__row")].map((row) => ({
    text: row.querySelector(".ww-script__step")?.textContent,
    button: row.querySelector("button")?.getAttribute("aria-label") ?? null,
    disabled: row.querySelector("button")?.hasAttribute("disabled") ?? null,
  }));

it("shows the three boxes of the script of Cupid from the start, with a button right of each but the last", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <Harness />
    </I18nextProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: /^Begin$/ }));
  fireEvent.click(document.querySelector(".ww-script__wake")!);
  // Before the choice: three boxes, no button can be pressed yet (no reset or X beside the script).
  expect(boxes().map((box) => box.text)).toEqual([
    "Cupid points at two people who fall in love.",
    expect.stringMatching(/goes back to sleep|falls asleep|sleep/i),
    "Touch both of them lightly on the shoulder.",
  ]);
  expect(boxes().map((box) => box.disabled)).toEqual([true, true, true]);
  // The two people are chosen in the list that covers the box.
  fireEvent.click(screen.getByRole("button", { name: /^Make lovers/ }));
  expect(document.querySelector(".ww-script")).toBeNull();
  const people = [...document.querySelectorAll<HTMLElement>(".ww-person")];
  fireEvent.click(people[0]!);
  expect(screen.getByRole("button", { name: "Confirm the choice" })).toBeDisabled();
  fireEvent.click(people[1]!);
  fireEvent.click(screen.getByRole("button", { name: "Confirm the choice" }));
  // The check closes the list only; the names stand in the third box, the step is not finished.
  expect(boxes()[2]!.text).toMatch(/^Touch P\d+ and P\d+ lightly on the shoulder\.$/);
  expect(boxes().map((box) => box.disabled)).toEqual([false, false, true]);
  // The check of the second box (Cupid sleeps) opens the third; its check finishes the step.
  fireEvent.click(document.querySelectorAll<HTMLElement>(".ww-script__check")[0]!);
  expect(boxes().map((box) => box.disabled)).toEqual([false, true, false]);
  fireEvent.click(document.querySelectorAll<HTMLElement>(".ww-script__check")[1]!);
  const summary = document.querySelector(".ww-guide__chosen");
  expect(summary?.textContent).toMatch(/^In love: P\d+, P\d+$/);
  expect(summary?.querySelector("svg")).not.toBeNull();
  // The lovers wake up: their script is a list, too (the names are the second task).
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  fireEvent.click(document.querySelector(".ww-script__wake")!);
  const items = [...document.querySelectorAll(".ww-guide__head .ww-script__item")].map(
    (item) => item.textContent,
  );
  expect(items[0]).toBe("The lovers open their eyes and look at each other.");
  expect(items[1]).toMatch(/^In love: P\d+ and P\d+$/);
});

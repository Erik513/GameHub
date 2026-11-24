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
  return <NarratorHarness start={toMagician} />;
}

const counts = () => document.querySelectorAll(".ww-ability__count").length;
const persons = () => [...document.querySelectorAll<HTMLElement>(".ww-person:not(:disabled)")];
const abilities = () => [...document.querySelectorAll<HTMLButtonElement>(".ww-ability")];

async function open() {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <Harness />
    </I18nextProvider>,
  );
  fireEvent.click(document.querySelector(".ww-script__wake")!);
  // The victim is shown (the check of the first box): only then the magician is asked.
  fireEvent.click(document.querySelector(".ww-script__check:not(.ww-script__wake)")!);
}

it("asks the magician two questions: heal or kill first, then a second death spell; the 2 goes once a spell is cast, and no other number takes its place", async () => {
  await open();
  // Both spells are there: a 2 on both buttons.
  expect(counts()).toBe(2);
  // First question: Kill; the list opens, one person is chosen, the check mark closes it and the second question follows.
  fireEvent.click(screen.getByRole("button", { name: /^Kill/ }));
  fireEvent.click(persons()[0]!);
  expect(counts()).toBe(2);
  fireEvent.click(screen.getByRole("button", { name: "Confirm the choice" }));
  // One spell is cast: no number on either button (not even a 1), the healing spell waits.
  expect(counts()).toBe(0);
  // Second question: only the death spell (and skip) can be pressed, the healing spell waits.
  expect(screen.getByRole("button", { name: /^Heal/ })).toBeDisabled();
  const kill = screen.getByRole("button", { name: /^Kill/ });
  expect(kill).toBeEnabled();
  fireEvent.click(kill);
  expect(document.querySelectorAll(".ww-person[aria-pressed='true']")).toHaveLength(1);
  fireEvent.click(persons().find((person) => person.getAttribute("aria-pressed") !== "true")!);
  expect(document.querySelectorAll(".ww-person[aria-pressed='true']")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "Confirm the choice" }));
  // Both questions are answered: the step is finished.
  expect(document.querySelector(".ww-guide__chosen")?.textContent).toMatch(
    /Killed: P\d+ \([^)]+\)Killed: P\d+ \([^)]+\)/,
  );
});

it("takes the 2 away and shows the spent spell as used after the magician skipped the first question and killed in the second", async () => {
  await open();
  fireEvent.click(screen.getByRole("button", { name: /^Skip/ }));
  fireEvent.click(screen.getByRole("button", { name: /^Kill/ }));
  // The list of the second spell is open: the first spell was skipped, nothing is cast yet, both spells are there.
  expect(counts()).toBe(2);
  fireEvent.click(persons()[0]!);
  fireEvent.click(screen.getByRole("button", { name: "Confirm the choice" }));
  // The death spell is cast: no number any more, it looks used up at once (not only the next night), the other waits.
  expect(counts()).toBe(0);
  expect(screen.getByRole("button", { name: /^Kill/ })).toHaveAttribute("data-state", "used");
  expect(screen.getByRole("button", { name: /^Heal/ })).toHaveAttribute("data-state", "dim");
  // The button that was used to skip is darkened, it does not turn black.
  expect(document.querySelector(".ww-ability--skip")).toHaveAttribute("data-state", "dim");
});

it("lets the magician heal in the first question and kill in the second", async () => {
  await open();
  fireEvent.click(screen.getByRole("button", { name: /^Heal/ }));
  // The second question: Kill and Skip are open.
  expect(abilities().filter((button) => !button.disabled).length).toBe(2);
  fireEvent.click(screen.getByRole("button", { name: /^Kill/ }));
  fireEvent.click(persons()[0]!);
  fireEvent.click(screen.getByRole("button", { name: "Confirm the choice" }));
  expect(document.querySelector(".ww-guide__chosen")?.textContent).toMatch(
    /Healed: P\d+ \([^)]+\)Killed: P\d+ \([^)]+\)/,
  );
});

it("lets the magician skip both questions: nothing is cast", async () => {
  await open();
  fireEvent.click(screen.getByRole("button", { name: /^Skip/ }));
  fireEvent.click(screen.getByRole("button", { name: /^Skip/ }));
  // The blue summary names both decisions: the healing and the death spell are both skipped.
  expect(document.querySelector(".ww-guide__chosen")?.textContent).toBe(
    "Save or kill: SkippedSecond spell: Skipped",
  );
});

it("shows the script of the magician as boxes: the victim, the first question, the second question, falling asleep", async () => {
  await open();
  const texts = [...document.querySelectorAll(".ww-script__step")].map((step) => step.textContent);
  expect(texts.slice(1)).toEqual([
    expect.stringMatching(/^Show the victim: /),
    "Save the victim () orkill somebody (point)?",
    "Use the second spell (point)?",
    expect.stringMatching(/magician goes back to sleep/i),
  ]);
  // The victim is about the attack of the wolves; the first question shows both spells and a thumb up as a sign.
  const steps = [...document.querySelectorAll(".ww-script__step")].slice(1);
  expect(steps[0]!.querySelector("[data-symbol]")?.getAttribute("data-symbol")).toBe("attacked");
  expect(
    [...steps[1]!.querySelectorAll("[data-symbol]")].map((symbol) =>
      symbol.getAttribute("data-symbol"),
    ),
  ).toEqual(["heal", "kill"]);
  expect(steps[1]!.querySelector(".ww-thumb")).not.toBeNull();
});

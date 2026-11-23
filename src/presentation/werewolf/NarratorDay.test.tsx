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

/** The day: a script of three boxes; the day can only be ended after an option was chosen. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

function toDay(): WerewolfSession {
  let session = createWerewolfSession(
    createWerewolf(names, "Max", () => 0.3, [], { attackOnFirstNight: true, wolfCount: 2 })!,
  );
  for (let step = 0; step < 100 && session.present.status !== "day"; step++) {
    const events = eventChoices(session.present).filter(
      (event) => !(event.type === "attack" && event.target === null),
    );
    session = advanceWerewolfSession(session, events[0]!);
  }
  return session;
}

function Harness() {
  const [session, setSession] = useState<WerewolfSession>(toDay);
  return (
    <NarratorView
      onEnd={() => undefined}
      onRules={() => undefined}
      onSession={setSession}
      session={session}
    />
  );
}

it("shows the script of the day and lets the day end only after an option was chosen", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <Harness />
    </I18nextProvider>,
  );
  const texts = () =>
    [...document.querySelectorAll(".ww-script__step")].map((box) => box.textContent);
  expect(texts()).toEqual([
    "Nominate somebody?(up to 3 people)",
    "Announce the summary and end the day",
  ]);
  const next = () => screen.getByRole("button", { name: /^(End the day|Next)/ });
  // The question has the symbol of the vote; the card of the day has no slots for effects.
  expect(document.querySelector(".ww-script__step [data-symbol='vote']")).not.toBeNull();
  expect(document.querySelector(".ww-role-card__slots")).toBeNull();
  // The upper box has no heading at the day; "no vote" has the blue frame as an option to choose.
  expect(document.querySelector(".ww-role-card__who")).toBeNull();
  expect(screen.getByRole("button", { name: "No nomination" })).toHaveAttribute("data-next");
  // Nothing chosen: the options above can be used at once, but the day cannot end and the reset is switched off.
  expect(screen.getByRole("button", { name: /^Nomination/ })).toBeEnabled();
  expect(screen.getByRole("button", { name: "No nomination" })).toBeEnabled();
  expect(next()).toBeDisabled();
  expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
  // "No nomination" is an option: now the day can end; the reset of the box takes it back.
  fireEvent.click(screen.getByRole("button", { name: "No nomination" }));
  expect(next()).toBeEnabled();
  expect(screen.getByRole("button", { name: "No nomination" })).toBeDisabled();
  // The blue summary says what was chosen: the symbol of the vote and "No nomination" (not "nothing chosen").
  expect(document.querySelector(".ww-guide__chosen")?.textContent).toBe("No nomination");
  expect(document.querySelector(".ww-guide__chosen svg")).not.toBeNull();
  // The vote cannot be used any more and has no frame; "Announce the summary and end the day" is the next step and has the blue frame.
  expect(screen.getByRole("button", { name: /^Nomination/ })).toBeDisabled();
  expect(screen.getByRole("button", { name: /^Nomination/ })).not.toHaveAttribute("data-next");
  expect([...document.querySelectorAll(".ww-script__step")].at(-1)).toHaveAttribute(
    "data-state",
    "active",
  );
  expect(screen.getByRole("button", { name: "No nomination" })).not.toHaveAttribute("data-next");
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(next()).toBeDisabled();
  expect(screen.getByRole("button", { name: "No nomination" })).toBeEnabled();
  // Taken back: nothing to sum up again.
  expect(document.querySelector(".ww-guide__chosen")).toBeNull();
});

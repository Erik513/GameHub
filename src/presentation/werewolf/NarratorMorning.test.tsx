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

/** The morning: every dead person in a box of their own; the reason of death shows on a tap and is covered by the next. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

function toMorning(): WerewolfSession {
  let session = createWerewolfSession(
    createWerewolf(names, "Max", () => 0.3, [], { attackOnFirstNight: true, wolfCount: 2 })!,
  );
  for (let step = 0; step < 100 && session.present.status !== "morning"; step++) {
    const events = eventChoices(session.present).filter(
      (event) => !(event.type === "attack" && event.target === null),
    );
    session = advanceWerewolfSession(session, events[0]!);
  }
  return session;
}

function Harness() {
  const [session, setSession] = useState<WerewolfSession>(toMorning);
  return (
    <NarratorView
      onEnd={() => undefined}
      onRules={() => undefined}
      onSession={setSession}
      session={session}
    />
  );
}

it("hides the reason of death in the morning until the person is tapped, and covers it again with the next tap", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <Harness />
    </I18nextProvider>,
  );
  const person = document.querySelector<HTMLButtonElement>(".ww-guide__dead li > button")!;
  // Closed: only the name stands there, no reason.
  expect(person).toHaveAttribute("aria-expanded", "false");
  expect(document.querySelector(".ww-guide__dead-causes")).toBeNull();
  expect(screen.queryByText(/for you only/)).toBeNull();
  // A tap shows it, the next tap covers it.
  fireEvent.click(person);
  expect(person).toHaveAttribute("aria-expanded", "true");
  expect(document.querySelector(".ww-guide__dead-causes")?.textContent).toMatch(/for you only/);
  fireEvent.click(person);
  expect(document.querySelector(".ww-guide__dead-causes")).toBeNull();
});

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

/** The drunk: a button shows his true role in a full-screen window, then a check goes on; the box has an undo button. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

function toDrunkReveal(): WerewolfSession {
  let session = createWerewolfSession(
    createWerewolf(names, "Max", () => 0.3, ["hunter"], {
      attackOnFirstNight: true,
      drunk: true,
      wolfCount: 2,
    })!,
  );
  for (let step = 0; step < 400 && session.present.status !== "drunkReveal"; step++) {
    const events = eventChoices(session.present).filter(
      (event) => !(event.type === "attack" && event.target === null),
    );
    // The day is simply ended (no nomination), so the game goes on to the next night.
    session = advanceWerewolfSession(
      session,
      events.find((event) => event.type === "endDay") ?? events[0]!,
    );
  }
  return session;
}

function Harness() {
  const [session, setSession] = useState<WerewolfSession>(toDrunkReveal);
  return (
    <NarratorView
      onEnd={() => undefined}
      onRules={() => undefined}
      onSession={setSession}
      session={session}
    />
  );
}

it("shows the true role of the drunk in a window, then the check goes on, and the undo shows it once more", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <Harness />
    </I18nextProvider>,
  );
  // The drunk wakes up (the check of the first box), then the button for the true role appears in the upper box.
  fireEvent.click(document.querySelector(".ww-script__wake")!);
  const show = screen.getByRole("button", { name: /Show the true role/ });
  // The box "show the true role" in the script has the symbol of the drunk (in a circle) in front of its text.
  const box = [...document.querySelectorAll(".ww-script__step")].find((step) =>
    step.textContent?.includes("Show the true role"),
  )!;
  expect(box.querySelector("[data-symbol='drunk']")).not.toBeNull();
  const check = () => screen.getByRole("button", { name: "Task done" });
  expect(show).toBeEnabled();
  // The check right of the box "show the true role" is switched off until the window was opened and closed.
  expect(check()).toBeDisabled();
  // (The upper box only has the button for the role; the check stands at the box in the script.)
  expect(document.querySelectorAll(".ww-role-card__reveal button")).toHaveLength(1);
  fireEvent.click(show);
  const dialog = screen.getByRole("dialog");
  expect(dialog).toBeInTheDocument();
  // The card names the true role (not the drunk).
  expect(dialog.textContent).not.toContain("Drunk");
  expect(check()).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Close the card" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(check()).toBeEnabled();
  // The check goes on: the same button right of the box is the undo now (the symbol toggles), the button for the role is off.
  fireEvent.click(check());
  expect(screen.queryByRole("button", { name: "Task done" })).toBeNull();
  const undo = screen.getByRole("button", { name: "Take the decision back" });
  expect(undo).toBeEnabled();
  expect(show).toBeDisabled();
  // Undo: back at the button, the true role can be shown once more (the check is switched off again).
  fireEvent.click(undo);
  expect(screen.getByRole("button", { name: /Show the true role/ })).toBeEnabled();
  expect(check()).toBeDisabled();
});

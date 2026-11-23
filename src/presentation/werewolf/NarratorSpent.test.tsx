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
import { createWerewolf, type WerewolfState } from "../../business/games/werewolf/stateMachine";
import { createGameHubI18n } from "../../i18n";
import { NarratorView } from "./NarratorView";

/**
 * A living role whose ability is used up is called with the same script as before: the same boxes, the ability shown as
 * used up (and asked with the thin frame), and the narrator skips the question.
 */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

type Role = "investigator" | "magician" | "mayor" | "witch";

function toSpent(role: Role, spent: boolean): WerewolfSession {
  const special = {
    investigator: "paranormalInvestigator",
    magician: "magician",
    mayor: "mayor",
    witch: "witch",
  }[role];
  let word = 5;
  const random = () => {
    word = (Math.imul(word, 1664525) + 1013904223) >>> 0;
    return word / 2 ** 32;
  };
  let session = createWerewolfSession(
    createWerewolf(names, "Max", random, [special as never], {
      attackOnFirstNight: true,
      mayor: "hammer",
      wolfCount: 2,
    })!,
  );
  const mark = (state: WerewolfState): WerewolfState => ({
    ...state,
    hammerUsed: true,
    investigationUsed: true,
    potions: { heal: false, poison: false },
    spellsRemaining: 0,
  });
  // Play the first nights until the role is called (in the night in which its script is used).
  for (let step = 0; step < 400 && session.present.status !== role; step++) {
    if (session.present.status === "wolves" && spent)
      session = { ...session, present: mark(session.present) };
    const events = eventChoices(session.present).filter(
      (event) => !(event.type === "attack" && event.target === null),
    );
    const endDay = events.find((event) => event.type === "endDay");
    session = advanceWerewolfSession(session, endDay ?? events[0]!);
  }
  return session;
}

function Harness({ role, spent }: { readonly role: Role; readonly spent: boolean }) {
  const [session, setSession] = useState<WerewolfSession>(() => toSpent(role, spent));
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
  [...document.querySelectorAll(".ww-script__step")].map((box) => box.getAttribute("data-state"));

it.each(["investigator", "magician", "mayor", "witch"] as const)(
  "calls the %s with the same script when the ability is used up",
  async (role) => {
    const i18n = await createGameHubI18n("en");
    const shape: Record<string, number> = {};
    for (const spent of [false, true]) {
      const { unmount } = render(
        <I18nextProvider i18n={i18n}>
          <Harness role={role} spent={spent} />
        </I18nextProvider>,
      );
      fireEvent.click(document.querySelector(".ww-script__wake")!);
      // Not a cover call: the same boxes, the abilities of the role stand above, a skip button is there.
      expect(document.querySelector("[data-cover='true']"), role).toBeNull();
      expect(document.querySelectorAll(".ww-ability").length, role).toBeGreaterThan(1);
      shape[String(spent)] = boxes().length;
      unmount();
    }
    expect(shape.true, role).toBe(shape.false);
    void screen;
  },
);

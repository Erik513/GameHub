import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import { createWerewolfSession, type WerewolfSession } from "../../business/games/werewolf/session";
import {
  createWerewolf,
  type WerewolfSettings,
  type WerewolfSpecialRole,
} from "../../business/games/werewolf/stateMachine";
import { createGameHubI18n } from "../../i18n";
import { NarratorView } from "./NarratorView";

/**
 * A narrator plays whole games through the screen alone (random taps on what is enabled): the screen never gets stuck,
 * never throws, and every game that is played to the end shows the winners. This checks that the screen mirrors the
 * whole logic (night roles, day, vote, hunter) and leaves no dead end.
 */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

function Harness({
  roles,
  seed,
  settings,
}: {
  readonly roles: readonly WerewolfSpecialRole[];
  readonly seed: number;
  readonly settings: Partial<WerewolfSettings>;
}) {
  const [session, setSession] = useState<WerewolfSession>(() => {
    let word = seed;
    const random = () => {
      word = (Math.imul(word, 1664525) + 1013904223) >>> 0;
      return word / 2 ** 32;
    };
    return createWerewolfSession(createWerewolf(names, "Max", random, roles, settings)!);
  });
  return (
    <NarratorView
      onEnd={() => undefined}
      onRules={() => undefined}
      onSession={setSession}
      session={session}
    />
  );
}

const isEnabled = (element: Element) => !(element as HTMLButtonElement).disabled;

/** The things a narrator can tap now, with a weight: going on is more likely than fiddling around. */
function candidates(): { element: Element; weight: number }[] {
  const all: { element: Element; weight: number }[] = [];
  const add = (selector: string, weight: number) => {
    for (const element of document.querySelectorAll(selector))
      if (isEnabled(element)) all.push({ element, weight });
  };
  add(".ww-script__wake", 4);
  add(".ww-nav .button--success", 4);
  // Back is rare: it only takes a step back.
  add(".ww-nav .button--secondary", 0.2);
  add(".ww-guide__confirm", 3);
  add(".ww-script__check:not(:disabled)", 3);
  add(".ww-ability", 2);
  add(".ww-person", 2);
  add(".ww-ballot__choice", 2);
  add(".ww-guide__reset", 1);
  // A list of people that has nobody to choose is closed again (the ability is then skipped).
  add(".ww-guide__close", 0.5);
  // Begin after the role reveal is the button "next" with the text "Begin": covered by .ww-nav .button.
  return all;
}

describe("NarratorView playthrough", () => {
  it.each([
    { roles: [] as WerewolfSpecialRole[], seed: 3, settings: { attackOnFirstNight: true } },
    {
      roles: ["witch", "hunter", "bodyguard", "cupid", "spellcaster"] as WerewolfSpecialRole[],
      seed: 5,
      settings: { amulet: true, attackOnFirstNight: true, wolfCount: 2 },
    },
    {
      roles: ["hunter", "witch", "tanner", "toughGuy"] as WerewolfSpecialRole[],
      seed: 11,
      settings: {
        attackOnFirstNight: true,
        drunk: true,
        hunterShot: "required" as const,
        wolfCount: 2,
      },
    },
    {
      roles: [
        "apprenticeSeer",
        "paranormalInvestigator",
        "nightGuest",
        "mayor",
      ] as WerewolfSpecialRole[],
      seed: 14,
      settings: { amulet: true, attackOnFirstNight: true, mayor: "hammer" as const, wolfCount: 2 },
    },
    {
      roles: ["magician", "hunter", "idiot", "mayor"] as WerewolfSpecialRole[],
      seed: 8,
      settings: { attackOnFirstNight: false, mayor: "hammer" as const, wolfCount: 2 },
    },
  ])(
    "plays a game to the end with taps alone: $roles",
    async ({ roles, seed, settings }) => {
      const i18n = await createGameHubI18n("en");
      render(
        <I18nextProvider i18n={i18n}>
          <Harness roles={roles} seed={seed} settings={settings} />
        </I18nextProvider>,
      );
      let word = seed * 97;
      const random = () => {
        word = (Math.imul(word, 1664525) + 1013904223) >>> 0;
        return word / 2 ** 32;
      };
      let finished = false;
      for (let step = 0; step < 7000; step++) {
        if (screen.queryByText("Game over – the winners")) {
          finished = true;
          break;
        }
        const options = candidates();
        if (options.length === 0) {
          const buttons = [...document.querySelectorAll("button")]
            .map((button) =>
              (button.getAttribute("aria-label") ?? button.textContent ?? "").slice(0, 30),
            )
            .join(" | ");
          throw new Error("stuck at step " + step + ": " + buttons);
        }
        const total = options.reduce((sum, option) => sum + option.weight, 0);
        let pick = random() * total;
        const chosen = options.find((option) => (pick -= option.weight) < 0) ?? options[0]!;
        fireEvent.click(chosen.element);
      }
      const last = (document.querySelector(".ww-night")?.textContent ?? "").slice(0, 300);
      cleanup();
      // The last text on the screen helps to find the place where a game does not end.
      expect(finished, last).toBe(true);
    },
    120000,
  );
});

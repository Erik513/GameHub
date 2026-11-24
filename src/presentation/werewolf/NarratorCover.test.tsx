import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { createWerewolfSession } from "../../business/games/werewolf/session";
import { createWerewolf, type WerewolfState } from "../../business/games/werewolf/stateMachine";
import { createGameHubI18n } from "../../i18n";
import { NarratorHarness } from "./narratorTestKit";

/**
 * A call that is only a cover: the role is the drunk who does not know it yet. The script is the same as for the awake
 * role, the card names the person, a yellow note says what he is, and the symbol of the role has the frame of the drunk.
 */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

/** The bodyguard is the drunk (and holds the amulet): the night call of the bodyguard is a cover. */
function bodyguardIsDrunk() {
  const base = createWerewolf(names, "Max", () => 0.3, ["bodyguard"], {
    amulet: true,
    drunk: true,
    wolfCount: 2,
  })!;
  const guard = base.players.find((player) => player.role === "bodyguard")!;
  const resume = {
    ...base,
    amulet: { holder: guard.name, mustPass: false },
    drunk: { player: guard.name, revealed: false },
    // The step after the call (the next role): the cover call is left towards it.
    status: "wolves",
  } as unknown as WerewolfState;
  const call = {
    ...resume,
    call: "bodyguard",
    resume,
    status: "nightCall",
  } as unknown as WerewolfState;
  return { guard: guard.name, session: createWerewolfSession(call) };
}

it("reads the same script as for the awake role, names the drunk and frames the symbol of the role", async () => {
  const { guard, session } = bodyguardIsDrunk();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <NarratorHarness start={() => session} />
    </I18nextProvider>,
  );
  // The words of the script: the role wakes up, the same question as for the awake role, the role goes to sleep.
  const boxes = [...document.querySelectorAll(".ww-script__step")].map((box) => box.textContent);
  expect(boxes.join("|")).not.toMatch(/Ask anyway/i);
  expect(boxes.some((text) => /bodyguard wakes up/i.test(text ?? ""))).toBe(true);
  expect(boxes.some((text) => /protect/i.test(text ?? ""))).toBe(true);
  expect(boxes.some((text) => /bodyguard goes back to sleep/i.test(text ?? ""))).toBe(true);
  // The role wakes up (the check of the first box): now the card names the person, and the symbol of the role has both
  // frames: the drunk (green) and the amulet (gold).
  fireEvent.click(document.querySelector(".ww-script__wake")!);
  expect(screen.getByText(guard)).toBeTruthy();
  const symbol = document.querySelector(".ww-role-card__role")!;
  expect(symbol).toHaveAttribute("data-drunk");
  expect(symbol).toHaveAttribute("data-amulet");
});

it("makes the narrator enter something even for a cover call: skip, and the decision can be undone", async () => {
  const { session } = bodyguardIsDrunk();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <NarratorHarness start={() => session} />
    </I18nextProvider>,
  );
  fireEvent.click(document.querySelector(".ww-script__wake")!);
  // Nothing can be chosen (the ability is not possible), but the narrator has to say so: the button "skip" is there.
  const skip = () => document.querySelector<HTMLButtonElement>(".ww-ability--skip")!;
  expect(skip()).toBeEnabled();
  expect(document.querySelector(".ww-script__undo:not(.ww-script__check)")).toBeDisabled();
  fireEvent.click(skip());
  // Skipped: the summary says so, the button is switched off and the undo button of the box takes it back.
  expect(document.querySelector(".ww-guide__chosen")?.textContent).toBe("Skipped");
  expect(skip()).toBeDisabled();
  const undo = document.querySelector<HTMLButtonElement>(
    ".ww-script__undo:not(.ww-script__check)",
  )!;
  expect(undo).toBeEnabled();
  fireEvent.click(undo);
  expect(skip()).toBeEnabled();
  expect(document.querySelector(".ww-guide__chosen")).toBeNull();
});

it("frames the ability that cannot be used in the thin blue frame and the skip button in the full one", async () => {
  const { session } = bodyguardIsDrunk();
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <NarratorHarness start={() => session} />
    </I18nextProvider>,
  );
  fireEvent.click(document.querySelector(".ww-script__wake")!);
  // The role is asked, but the ability is not possible (the drunk cannot act): thin frame; "skip" is what to press next.
  const ability = document.querySelector(".ww-ability:not(.ww-ability--skip)")!;
  expect(ability).toHaveAttribute("data-state", "blocked");
  expect(ability).toHaveAttribute("data-next", "thin");
  expect(document.querySelector(".ww-ability--skip")).toHaveAttribute("data-next", "true");
  // Once skipped, no frame is left.
  fireEvent.click(document.querySelector(".ww-ability--skip")!);
  expect(document.querySelector(".ww-ability:not(.ww-ability--skip)")).not.toHaveAttribute(
    "data-next",
  );
});

it("explains in a yellow note who is behind the call", async () => {
  const { guard, session } = bodyguardIsDrunk();
  const i18n = await createGameHubI18n("de");
  render(
    <I18nextProvider i18n={i18n}>
      <NarratorHarness start={() => session} />
    </I18nextProvider>,
  );
  fireEvent.click(document.querySelector(".ww-script__wake")!);
  const notes = [...document.querySelectorAll(".ww-guide__victim")].map((note) => note.textContent);
  expect(notes).toContain(`${guard} (Trunkenbold): kennt die Rolle noch nicht, nichts wählen`);
});

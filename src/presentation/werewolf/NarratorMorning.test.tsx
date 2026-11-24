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
import { createWerewolf, werewolfAnnouncement } from "../../business/games/werewolf/stateMachine";
import { createGameHubI18n } from "../../i18n";
import { NarratorView } from "./NarratorView";

/** The morning: every dead person in a box of their own; the reason of death shows on a tap and is covered by the next. */

const names = Array.from({ length: 12 }, (_, index) => "P" + index).join(",");

/** The night to the morning; with `hunterDies` the wolves attack the hunter. */
function toMorning(hunterDies = false): WerewolfSession {
  let session = createWerewolfSession(
    createWerewolf(names, "Max", () => 0.3, hunterDies ? ["hunter"] : [], {
      attackOnFirstNight: true,
      wolfCount: 2,
    })!,
  );
  for (let step = 0; step < 100 && session.present.status !== "morning"; step++) {
    const hunter = session.present.players.find((player) => player.role === "hunter")?.name;
    const events = eventChoices(session.present).filter(
      (event) =>
        !(event.type === "attack" && event.target === null) &&
        !(hunterDies && event.type === "attack" && event.target !== hunter),
    );
    session = advanceWerewolfSession(session, events[0]!);
  }
  return session;
}

function Harness({ hunterDies = false }: { readonly hunterDies?: boolean }) {
  const [session, setSession] = useState<WerewolfSession>(() => toMorning(hunterDies));
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
  // The eye before the name is closed while the reason is covered.
  expect(person.querySelector("[data-eye]")?.getAttribute("data-eye")).toBe("closed");
  expect(document.querySelector(".ww-guide__dead-causes")).toBeNull();
  expect(screen.queryByText(/for you only/)).toBeNull();
  // A tap shows it, the next tap covers it.
  fireEvent.click(person);
  expect(person).toHaveAttribute("aria-expanded", "true");
  expect(person.querySelector("[data-eye]")?.getAttribute("data-eye")).toBe("open");
  expect(document.querySelector(".ww-guide__dead-causes")?.textContent).toMatch(/for you only/);
  fireEvent.click(person);
  expect(document.querySelector(".ww-guide__dead-causes")).toBeNull();
});

it("shows the role in brackets behind the name once the person is tapped, and keeps a place for the amulet that is lost", async () => {
  const i18n = await createGameHubI18n("en");
  const morning = toMorning();
  const victim =
    morning.present.alive.length > 0 ? werewolfAnnouncement(morning.present)[0]!.name : "";
  // The victim holds the amulet: it is lost with his death.
  const holding = {
    ...morning,
    present: { ...morning.present, amulet: { holder: victim, mustPass: false } },
  } as WerewolfSession;
  render(
    <I18nextProvider i18n={i18n}>
      <NarratorView
        onEnd={() => undefined}
        onRules={() => undefined}
        onSession={() => undefined}
        session={holding}
      />
    </I18nextProvider>,
  );
  const person = document.querySelector<HTMLButtonElement>(".ww-guide__dead li > button")!;
  // Covered: only the name, no role.
  expect(person.textContent).not.toContain("(");
  fireEvent.click(person);
  const role = morning.present.players.find((player) => player.name === victim)!.role;
  const roleName = role === "villager" ? "Villager" : undefined;
  expect(person.textContent).toMatch(/\([A-Za-z ]+\)/);
  if (roleName) expect(person.textContent).toContain("(" + roleName + ")");
  // The place at the bottom right: always there, with the amulet in it when it is lost.
  const slot = document.querySelector(".ww-guide__dead-slot")!;
  expect(slot).not.toBeNull();
  expect(slot.querySelector("[data-symbol='amulet']")).not.toBeNull();
});

it("keeps the place for the amulet empty when the amulet is not lost", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <Harness />
    </I18nextProvider>,
  );
  fireEvent.click(document.querySelector(".ww-guide__dead li > button")!);
  const slot = document.querySelector(".ww-guide__dead-slot")!;
  expect(slot).not.toBeNull();
  expect(slot.querySelector("[data-symbol='amulet']")).toBeNull();
});

it("shows the category last shot only when the hunter dies, and then only him in it", async () => {
  const i18n = await createGameHubI18n("en");
  const first = render(
    <I18nextProvider i18n={i18n}>
      <Harness />
    </I18nextProvider>,
  );
  // An ordinary morning: the dead, no last shot.
  expect(screen.getByText("Died")).toBeInTheDocument();
  expect(screen.queryByText("Last shot")).toBeNull();
  first.unmount();
  // The hunter dies: he stands alone in the category last shot, with his role; nobody else needs the category of the dead.
  render(
    <I18nextProvider i18n={i18n}>
      <Harness hunterDies />
    </I18nextProvider>,
  );
  expect(screen.getByText("Last shot")).toBeInTheDocument();
  expect(document.querySelectorAll(".ww-guide__dead li[data-role='hunter']")).toHaveLength(1);
  expect(screen.queryByText("Died")).toBeNull();
});

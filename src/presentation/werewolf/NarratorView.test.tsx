import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import { createWerewolfSession, type WerewolfSession } from "../../business/games/werewolf/session";
import { createWerewolf } from "../../business/games/werewolf/stateMachine";
import { createGameHubI18n } from "../../i18n";
import { NarratorView } from "./NarratorView";

const names = "Anna,Ben,Cleo,Dora,Emil,Finn,Gina,Hans,Ida,Jan,Kim,Lea";

function Harness({ onEnd }: { readonly onEnd: () => void }) {
  const [session, setSession] = useState<WerewolfSession>(() =>
    createWerewolfSession(createWerewolf(names, "Max", () => 0.3, [], {})!),
  );
  return (
    <NarratorView
      onEnd={onEnd}
      onRules={() => undefined}
      onSession={setSession}
      session={session}
    />
  );
}

async function renderView(language: "en" | "de", onEnd = () => undefined) {
  const i18n = await createGameHubI18n(language);
  const user = userEvent.setup();
  render(
    <I18nextProvider i18n={i18n}>
      <Harness onEnd={onEnd} />
    </I18nextProvider>,
  );
  return user;
}

describe.each([
  {
    back: "Back",
    next: "Next",
    language: "en",
    reveal: "Hand the device to this person.",
    wake: /werewolves wake up/,
  },
  {
    back: "Zurück",
    next: "Weiter",
    language: "de",
    reveal: "Gib das Gerät an diese Person weiter.",
    wake: /Werwölfe erwachen/,
  },
] as const)("NarratorView in $language", ({ back, language, next, reveal, wake }) => {
  it("leads from the role reveal to the first role and back", async () => {
    const user = await renderView(language);
    expect(screen.getByText(reveal)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: back })).toBeDisabled();
    for (let player = 0; player < 12; player += 1)
      await user.click(screen.getByRole("button", { name: next }));
    // The role is announced; the upper box stays hidden until the narrator taps.
    expect(screen.getByText(wake)).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: /Werewolf|Werwolf/ })).toBeNull();
    await user.click(screen.getByText(wake));
    expect(screen.getByRole("region", { name: /Werewolf|Werwolf/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: back }));
    expect(screen.getByText(wake)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: back }));
    expect(screen.getByText(reveal)).toBeInTheDocument();
  });

  it("shows the role on a tap, covers it on the next tap and explains it", async () => {
    const user = await renderView(language);
    const face = screen.getAllByRole("button", { pressed: false })[0]!;
    expect(screen.queryByRole("button", { name: /Info|info/ })).toBeNull();
    await user.click(face);
    expect(screen.getByRole("button", { pressed: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Info|info/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { pressed: true }));
    expect(screen.getByText(reveal)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Info|info/ })).toBeNull();
  });

  it("asks before it ends the game", async () => {
    const onEnd = vi.fn();
    const user = await renderView(language, onEnd);
    await user.click(screen.getByRole("button", { name: /End game|Spiel beenden/ }));
    expect(onEnd).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /No|Nein/ }));
    await user.click(screen.getByRole("button", { name: /End game|Spiel beenden/ }));
    await user.click(screen.getByRole("button", { name: /Yes, end it|Ja, beenden/ }));
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});

describe("NarratorView choices", () => {
  it("lets the narrator choose a person for the seer and shows what the seer sees", async () => {
    const user = await renderView("en");
    const nextButton = () => screen.getByRole("button", { name: "Next" });
    // Walk to the seer: role reveal, wolves (intro, act, outro), seer intro.
    for (let guard = 0; guard < 30 && !screen.queryByText(/seer wakes up/); guard += 1)
      await user.click(nextButton());
    await user.click(screen.getByText(/seer wakes up/));
    expect(nextButton()).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /Look: ready/ }));
    const person = names.split(",").find((name) => screen.queryByRole("button", { name }))!;
    await user.click(screen.getByRole("button", { name: person }));
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
    expect(nextButton()).toBeEnabled();
    await user.click(nextButton());
    expect(screen.getByText(new RegExp(`${person} is (not )?a werewolf`))).toBeInTheDocument();
  });

  it("lists the people in alphabetical order, all equally, and closes the list with the X", async () => {
    const user = await renderView("en");
    for (let guard = 0; guard < 30 && !screen.queryByText(/seer wakes up/); guard += 1)
      await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByText(/seer wakes up/));
    expect(screen.queryByRole("button", { name: "Close the selection" })).toBeNull();
    await user.click(screen.getByRole("button", { name: /Look: ready/ }));
    const people = screen
      .getAllByRole("button")
      .filter((button) => button.classList.contains("ww-person"))
      .map((button) => button.textContent ?? "");
    expect(people.length).toBeGreaterThan(5);
    expect(people).toEqual([...people].sort((a, b) => a.localeCompare(b)));
    await user.click(screen.getByRole("button", { name: "Close the selection" }));
    expect(
      screen.queryAllByRole("button").filter((button) => button.classList.contains("ww-person")),
    ).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Close the selection" })).toBeNull();
  });
});

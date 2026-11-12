import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import type { TeamSetupMemory } from "../../business/shared/savedTeamSetup";
import { initialTeamSetup, type TeamSetupValue } from "../../business/shared/teamSetup";
import { createGameHubI18n } from "../../i18n";
import { PlayersSetup } from "./PlayersSetup";
import { TeamSetupMemoryProvider } from "./TeamSetupMemoryProvider";
import { TeamsSetup } from "./TeamsSetup";

const remembered: TeamSetupValue = {
  assignment: { Anna: 1 },
  count: 9,
  names: ["Red", "Blue"],
  order: "entered",
  playersText: "Anna, Ben",
};
const memory = (value: TeamSetupValue | undefined): TeamSetupMemory => ({
  read: () => value,
  write: () => undefined,
});

async function renderTeams(language: "en" | "de", stored: TeamSetupValue | undefined) {
  const i18n = await createGameHubI18n(language);
  const latest = { value: initialTeamSetup() };
  function Host() {
    const [value, setValue] = useState(latest.value);
    return (
      <TeamsSetup
        onChange={(next) => {
          latest.value = next;
          setValue(next);
        }}
        value={value}
      />
    );
  }
  render(
    <I18nextProvider i18n={i18n}>
      <TeamSetupMemoryProvider memory={memory(stored)}>
        <Host />
      </TeamSetupMemoryProvider>
    </I18nextProvider>,
  );
  return { latest, user: userEvent.setup() };
}

it.each([
  ["en", "Load last group"],
  ["de", "Letzte Gruppe laden"],
] as const)(
  "loads the last group into the teams once and hides the button in %s",
  async (language, label) => {
    const { latest, user } = await renderTeams(language, remembered);
    await user.click(screen.getByRole("button", { name: label }));
    // A count above the limit of the game is brought back into the limits.
    expect(latest.value).toEqual({ ...remembered, count: 6 });
    expect(screen.queryByRole("button", { name: label })).not.toBeInTheDocument();
  },
);

it("offers nothing when no group was remembered", async () => {
  await renderTeams("en", undefined);
  expect(screen.queryByRole("button", { name: "Load last group" })).not.toBeInTheDocument();
});

it("works without a memory provider", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <TeamsSetup onChange={() => undefined} value={initialTeamSetup()} />
    </I18nextProvider>,
  );
  expect(screen.queryByRole("button", { name: "Load last group" })).not.toBeInTheDocument();
});

it.each([
  ["en", "Load last players"],
  ["de", "Letzte Spieler laden"],
] as const)("loads the last players into a game without teams in %s", async (language, label) => {
  const i18n = await createGameHubI18n(language);
  function Host() {
    const [text, setText] = useState("");
    return <PlayersSetup onChange={setText} value={text} />;
  }
  render(
    <I18nextProvider i18n={i18n}>
      <TeamSetupMemoryProvider memory={memory(remembered)}>
        <Host />
      </TeamSetupMemoryProvider>
    </I18nextProvider>,
  );
  await userEvent.click(screen.getByRole("button", { name: label }));
  expect(screen.getByRole("textbox")).toHaveValue("Anna, Ben");
  expect(screen.queryByRole("button", { name: label })).not.toBeInTheDocument();
});

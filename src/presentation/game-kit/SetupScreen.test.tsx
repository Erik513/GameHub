import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { PlayersSetup } from "./PlayersSetup";
import { SetupScreen } from "./SetupScreen";
import { SetupSection } from "./SetupSection";

it("frames the sections with messages and a start button that submits the form, with the rules and editor buttons in their chapters", async () => {
  const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
  const onChange = vi.fn();
  render(
    <SetupScreen
      formId="demo"
      messages={<p role="alert">Something is wrong</p>}
      onChange={onChange}
      onSubmit={onSubmit}
      startLabel="Start"
    >
      <SetupSection title="Teams and players">
        <input aria-label="Team name" />
      </SetupSection>
      <SetupSection title="Game settings">
        <button type="button">Rules</button>
      </SetupSection>
      <SetupSection title="Cards">
        <button type="button">Editor</button>
      </SetupSection>
    </SetupScreen>,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Something is wrong");
  // The rules belong to the game settings, the editor to the chapter of the cards.
  expect(
    within(screen.getByRole("region", { name: "Game settings" })).getByRole("button", {
      name: "Rules",
    }),
  ).toBeVisible();
  expect(
    within(screen.getByRole("region", { name: "Cards" })).getByRole("button", { name: "Editor" }),
  ).toBeVisible();
  const teams = screen.getByRole("region", { name: "Teams and players" });
  expect(within(teams).getByRole("textbox", { name: "Team name" })).toBeVisible();
  expect(screen.getByRole("region", { name: "Game settings" })).toBeVisible();

  fireEvent.change(screen.getByRole("textbox", { name: "Team name" }), { target: { value: "x" } });
  expect(onChange).toHaveBeenCalledOnce();
  await userEvent.click(screen.getByRole("button", { name: "Start" }));
  expect(onSubmit).toHaveBeenCalledOnce();
});

it("lets every chapter be collapsed and expanded", async () => {
  render(
    <SetupScreen formId="demo" onSubmit={vi.fn()} startLabel="Start">
      <SetupSection title="Teams">
        <input aria-label="Team name" />
      </SetupSection>
      <SetupSection defaultOpen={false} title="Settings">
        <input aria-label="Setting" />
      </SetupSection>
    </SetupScreen>,
  );
  expect(screen.getByRole("textbox", { name: "Team name" })).toBeVisible();
  expect(screen.getByRole("textbox", { name: "Setting" })).not.toBeVisible();
  await userEvent.click(screen.getByRole("heading", { name: "Teams" }));
  expect(screen.getByRole("textbox", { name: "Team name" })).not.toBeVisible();
  await userEvent.click(screen.getByRole("heading", { name: "Settings" }));
  expect(screen.getByRole("textbox", { name: "Setting" })).toBeVisible();
});

it("can lock the start button and works without messages", () => {
  render(
    <SetupScreen formId="demo" onSubmit={vi.fn()} startDisabled startLabel="Preparing">
      <p>Body</p>
    </SetupScreen>,
  );
  expect(screen.getByRole("button", { name: "Preparing" })).toBeDisabled();
});

it.each([
  ["en", "Add player", "Add", "Remove Ben", "Players: 2", "Players: 1"],
  ["de", "Spieler hinzufügen", "Hinzufügen", "Ben entfernen", "Spieler: 2", "Spieler: 1"],
] as const)(
  "lists the players of a game without teams in %s",
  async (language, label, add, remove, two, one) => {
    const i18n = await createGameHubI18n(language);
    function Host() {
      const [text, setText] = useState("");
      return <PlayersSetup onChange={setText} value={text} />;
    }
    render(
      <I18nextProvider i18n={i18n}>
        <Host />
      </I18nextProvider>,
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    const user = userEvent.setup();
    // The same name twice (in another case) counts once.
    await user.type(screen.getByLabelText(label), "anna, Ben, ANNA");
    await user.click(screen.getByRole("button", { name: add }));
    expect(screen.getByRole("status")).toHaveTextContent(two);
    // A player can be removed again.
    await user.click(screen.getByRole("button", { name: remove }));
    expect(screen.getByRole("status")).toHaveTextContent(one);
  },
);

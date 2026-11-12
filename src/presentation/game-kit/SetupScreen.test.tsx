import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { PlayersSetup } from "./PlayersSetup";
import { SetupScreen } from "./SetupScreen";
import { SetupSection } from "./SetupSection";

it("frames the sections with messages, the rules and editor buttons and a start button that submits the form", async () => {
  const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
  const onChange = vi.fn();
  render(
    <SetupScreen
      formId="demo"
      messages={<p role="alert">Something is wrong</p>}
      onChange={onChange}
      onSubmit={onSubmit}
      startLabel="Start"
      editor={<button type="button">Editor</button>}
      rules={<button type="button">Rules</button>}
    >
      <SetupSection title="Teams and players">
        <input aria-label="Team name" />
      </SetupSection>
      <SetupSection title="Game settings">
        <p>Settings</p>
      </SetupSection>
    </SetupScreen>,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Something is wrong");
  expect(screen.getByRole("button", { name: "Rules" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Editor" })).toBeVisible();
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
    <SetupScreen
      formId="demo"
      onSubmit={vi.fn()}
      rules={<button type="button">Rules</button>}
      startLabel="Start"
    >
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

it("can lock the start button and works without messages or editor", () => {
  render(
    <SetupScreen
      formId="demo"
      onSubmit={vi.fn()}
      rules={<button type="button">Rules</button>}
      startDisabled
      startLabel="Preparing"
    >
      <p>Body</p>
    </SetupScreen>,
  );
  expect(screen.getByRole("button", { name: "Preparing" })).toBeDisabled();
  expect(screen.queryByRole("button", { name: "Editor" })).not.toBeInTheDocument();
});

it.each([
  ["en", "Players", "Player names", "Players: 2", "Players: 1"],
  ["de", "Spieler", "Spielernamen", "Spieler: 2", "Spieler: 1"],
] as const)(
  "lists the players of a game without teams in %s",
  async (language, heading, label, two, one) => {
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
    expect(screen.getByRole("heading", { name: heading })).toBeVisible();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(label), "Anna, Ben, anna");
    expect(screen.getByRole("status")).toHaveTextContent(two);
    await user.clear(screen.getByLabelText(label));
    await user.type(screen.getByLabelText(label), "Anna");
    expect(screen.getByRole("status")).toHaveTextContent(one);
  },
);

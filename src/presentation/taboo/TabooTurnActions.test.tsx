import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import type { TabooOutcome } from "../../business/games/taboo/stateMachine";
import { createGameHubI18n } from "../../i18n";
import { TabooTurnActions } from "./TabooTurnActions";

async function renderActions(
  language: "en" | "de",
  overrides: Partial<React.ComponentProps<typeof TabooTurnActions>> = {},
) {
  const onPress = vi.fn<(outcome: TabooOutcome) => void>();
  const onTogglePause = vi.fn();
  const i18n = await createGameHubI18n(language);
  const view = (props: Partial<React.ComponentProps<typeof TabooTurnActions>>) => (
    <I18nextProvider i18n={i18n}>
      <TabooTurnActions
        disabled={() => false}
        onPress={onPress}
        onTogglePause={onTogglePause}
        paused={false}
        skipHidden={false}
        {...overrides}
        {...props}
      />
    </I18nextProvider>
  );
  const { rerender } = render(view({}));
  return {
    onPress,
    onTogglePause,
    update: (props: Partial<React.ComponentProps<typeof TabooTurnActions>>) =>
      rerender(view(props)),
  };
}

it.each([
  ["en", "Space", "Skip", "Forbidden word", "Pause", "Resume"],
  ["de", "Leertaste", "Überspringen", "Verbotenes Wort", "Pause", "Fortsetzen"],
] as const)(
  "shows the keys at the buttons and names them for screen readers in %s",
  async (language, space, skip, forbidden, pause, resume) => {
    const { update } = await renderActions(language);
    expect(screen.getByRole("button", { name: /^(Correct|Richtig)/ })).toHaveAttribute(
      "aria-keyshortcuts",
      "Space Enter",
    );
    expect(screen.getByRole("button", { name: new RegExp(`^${skip}`) })).toHaveAttribute(
      "aria-keyshortcuts",
      "S",
    );
    expect(screen.getByRole("button", { name: new RegExp(`^${forbidden}`) })).toHaveAttribute(
      "aria-keyshortcuts",
      "V",
    );
    // The keys are drawn (a phone hides them by style) but not read.
    expect(screen.getByText(space)).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("S")).toHaveClass("kit-shortcut-hint");
    expect(screen.getByText("V")).toHaveClass("kit-shortcut-hint");
    expect(screen.getByText(pause, { selector: "p" })).toBeInTheDocument();
    update({ paused: true });
    expect(screen.getByText(resume, { selector: "p" })).toBeInTheDocument();
  },
);

it("gives the answers with the keys, once per press, and the pause with P", async () => {
  const { onPress, onTogglePause } = await renderActions("en");
  fireEvent.keyDown(document.body, { key: " " });
  fireEvent.keyDown(document.body, { key: "Enter" });
  fireEvent.keyDown(document.body, { key: "s" });
  fireEvent.keyDown(document.body, { key: "V" });
  fireEvent.keyDown(document.body, { key: "x" });
  fireEvent.keyDown(document.body, { key: "p" });
  expect(onPress.mock.calls.map(([outcome]) => outcome)).toEqual([
    "correct",
    "correct",
    "skipped",
    "forbiddenWord",
  ]);
  expect(onTogglePause).toHaveBeenCalledTimes(1);
  // A button does what a click does.
  fireEvent.click(screen.getByRole("button", { name: /^Skip/ }));
  expect(onPress).toHaveBeenLastCalledWith("skipped");
});

it("does nothing for a button that is gone or disabled, and only the pause works while paused", async () => {
  const { onPress, onTogglePause, update } = await renderActions("en", {
    disabled: (outcome) => outcome === "forbiddenWord",
    skipHidden: true,
  });
  expect(screen.queryByRole("button", { name: /^Skip/ })).not.toBeInTheDocument();
  fireEvent.keyDown(document.body, { key: "s" });
  fireEvent.keyDown(document.body, { key: "v" });
  expect(onPress).not.toHaveBeenCalled();
  fireEvent.keyDown(document.body, { key: " " });
  expect(onPress).toHaveBeenCalledWith("correct");
  onPress.mockClear();
  update({ paused: true });
  fireEvent.keyDown(document.body, { key: " " });
  fireEvent.keyDown(document.body, { key: "Enter" });
  expect(onPress).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: /^Correct/ })).toBeDisabled();
  fireEvent.keyDown(document.body, { key: "p" });
  expect(onTogglePause).toHaveBeenCalledTimes(1);
});

it("shows a hint below the skip button and as its title", async () => {
  await renderActions("en", { hints: { skipped: "once per game" } });
  const skip = screen.getByRole("button", { name: /^Skip/ });
  expect(skip).toHaveAttribute("title", "once per game");
  expect(skip).toHaveTextContent("once per game");
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it, vi } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { GameBar } from "./GameBar";

it.each([
  { language: "en", rules: "Rules", end: "End game" },
  { language: "de", rules: "Spielregeln", end: "Spiel beenden" },
] as const)(
  "shows the status, the rules, the game's own buttons and $end in $language",
  async ({ language, rules, end }) => {
    const i18n = await createGameHubI18n(language);
    const onRules = vi.fn();
    const onEnd = vi.fn();
    const user = userEvent.setup();
    render(
      <I18nextProvider i18n={i18n}>
        <GameBar icon="cards" onEnd={onEnd} onRules={onRules} status="Round 2/5">
          <button type="button">Own</button>
        </GameBar>
      </I18nextProvider>,
    );
    expect(screen.getByText("Round 2/5")).toBeInTheDocument();
    const buttons = screen
      .getAllByRole("button")
      .map((button) => button.getAttribute("aria-label") ?? button.textContent);
    expect(buttons).toEqual([rules, "Own", end]);

    await user.click(screen.getByRole("button", { name: rules }));
    expect(onRules).toHaveBeenCalledOnce();
    // "End game" asks first: only the second tap ends the game.
    await user.click(screen.getByRole("button", { name: end }));
    expect(onEnd).not.toHaveBeenCalled();
    // A tap right after the first one is ignored (double tap).
    await new Promise((resolve) => setTimeout(resolve, 450));
    await user.click(screen.getAllByRole("button").at(-1)!);
    expect(onEnd).toHaveBeenCalledOnce();
  },
);

it("leaves out the rules and the end without their actions and names the status for screen readers", async () => {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <GameBar statusLabel="Night 1" tone="night" status="1" />
    </I18nextProvider>,
  );
  expect(screen.queryAllByRole("button")).toEqual([]);
  expect(screen.getByRole("img", { name: "Night 1" })).toHaveAttribute("data-tone", "night");
});

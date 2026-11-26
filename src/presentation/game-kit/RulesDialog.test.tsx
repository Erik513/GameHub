import { render, screen, within } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { RulesDialog } from "./RulesDialog";
import { RulesSection } from "./RulesSection";

async function renderRules(withTabs: boolean) {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <RulesDialog
        onClose={() => undefined}
        open
        title="Game rules"
        {...(withTabs
          ? {
              tabs: [
                { content: <p>The goal</p>, id: "game", label: "Game" },
                { content: <p>The roles</p>, id: "roles", label: "Roles" },
              ],
              tabsLabel: "Rules",
            }
          : {})}
      >
        <RulesSection title="Goal">
          <p>Win.</p>
        </RulesSection>
      </RulesDialog>
    </I18nextProvider>,
  );
  return screen.getByRole("dialog", { name: "Game rules" });
}

it("shows the rules of a game as tabs in a large window with a close button", async () => {
  const dialog = await renderRules(true);
  expect(
    within(dialog)
      .getAllByRole("tab")
      .map((tab) => tab.textContent),
  ).toEqual(["Game", "Roles"]);
  expect(dialog.querySelector(".kit-rules")).not.toBeNull();
  expect(within(dialog).getByRole("button", { name: "Close" })).toBeInTheDocument();
});

it("shows the rules of a game as sections when there are no tabs", async () => {
  const dialog = await renderRules(false);
  expect(within(dialog).queryByRole("tab")).toBeNull();
  expect(within(dialog).getByRole("heading", { name: "Goal" })).toBeInTheDocument();
});

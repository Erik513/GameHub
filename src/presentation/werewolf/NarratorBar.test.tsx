import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import { isDayStep } from "../../business/games/werewolf/narratorGuide";
import { createWerewolf, type WerewolfState } from "../../business/games/werewolf/stateMachine";
import { createGameHubI18n } from "../../i18n";
import { NarratorBar } from "./NarratorBar";

const names = "Anna,Ben,Cleo,Dora,Emil,Finn,Gina,Hans,Ida,Jan,Kim,Lea";
const state = createWerewolf(names, "Max", () => 0.3, [], {})!;
/** The same game once the roles are dealt: the night begins. */
const running = { ...state, status: "wolves" } as unknown as WerewolfState;

async function renderBar(
  language: "en" | "de",
  day: boolean,
  onClose = () => undefined,
  onRules = () => undefined,
) {
  const i18n = await createGameHubI18n(language);
  const user = userEvent.setup();
  render(
    <I18nextProvider i18n={i18n}>
      <NarratorBar day={day} onClose={onClose} onRules={onRules} state={running} />
    </I18nextProvider>,
  );
  return user;
}

describe("NarratorBar", () => {
  it.each([
    { day: false, language: "en", label: "Night 1" },
    { day: true, language: "en", label: "Day 1" },
    { day: false, language: "de", label: "Nacht 1" },
    { day: true, language: "de", label: "Tag 1" },
  ] as const)("shows $label in $language", async ({ day, label, language }) => {
    await renderBar(language, day);
    expect(screen.getByRole("img", { name: label })).toBeInTheDocument();
  });

  it("opens the overview of all players with their roles and closes it again", async () => {
    const user = await renderBar("en", false);
    await user.click(screen.getByRole("button", { name: "All players and roles" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getAllByRole("listitem")).toHaveLength(12);
    expect(within(dialog).getByText("Anna")).toBeInTheDocument();
    const order = within(dialog)
      .getAllByRole("listitem")
      .map((row) => row.querySelector("strong")?.textContent ?? "");
    expect(order).toEqual([...order].sort((one, other) => one.localeCompare(other)));
    expect(within(dialog).getByText("For the narrator only")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: /Close|close/ }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens the rules through the book symbol", async () => {
    const onRules = vi.fn();
    const user = await renderBar("en", false, () => undefined, onRules);
    await user.click(screen.getByRole("button", { name: "Rules" }));
    expect(onRules).toHaveBeenCalledTimes(1);
  });

  it("asks to leave through the close button", async () => {
    const onClose = vi.fn();
    const user = await renderBar("de", false, onClose);
    await user.click(screen.getByRole("button", { name: "Spiel beenden" }));
    // The first tap only asks, inside the button.
    expect(onClose).not.toHaveBeenCalled();
    const armed = screen.getByRole("button", { name: "Nochmal tippen zum Beenden" });
    expect(armed).toHaveTextContent("Beenden?");
    // A tap right after arming is ignored (double tap), the next one confirms.
    await new Promise((resolve) => setTimeout(resolve, 450));
    await user.click(armed);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("NarratorBar during the role reveal", () => {
  it("shows neither the overview of all roles nor the rules, only the close button", async () => {
    const i18n = await createGameHubI18n("en");
    render(
      <I18nextProvider i18n={i18n}>
        <NarratorBar
          day={false}
          onClose={() => undefined}
          onRules={() => undefined}
          state={state}
        />
      </I18nextProvider>,
    );
    // The state of the line-up is the role reveal.
    expect(state.status).toBe("roles");
    expect(screen.queryByRole("button", { name: "All players and roles" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Rules" })).toBeNull();
    // No moon and no night while the players look at their roles.
    expect(screen.queryByRole("img", { name: /Night|Nacht/ })).toBeNull();
    expect(screen.getByText("Role reveal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "End game" })).toBeInTheDocument();
  });

  it("shows them as soon as the game begins", async () => {
    const i18n = await createGameHubI18n("en");
    render(
      <I18nextProvider i18n={i18n}>
        <NarratorBar
          day={false}
          onClose={() => undefined}
          onRules={() => undefined}
          state={{ ...state, status: "wolves" } as unknown as WerewolfState}
        />
      </I18nextProvider>,
    );
    expect(screen.getByRole("button", { name: "All players and roles" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rules" })).toBeInTheDocument();
  });
});

describe("isDayStep", () => {
  it("is day from the morning on and night in the role reveal and the night", () => {
    const at = (status: string) => ({ ...state, status }) as unknown as WerewolfState;
    for (const status of ["morning", "day", "vote", "exile", "hunter", "drunkHunter", "finished"])
      expect(isDayStep(at(status)), status).toBe(true);
    for (const status of ["roles", "wolves", "witch", "nightCall", "cupid"])
      expect(isDayStep(at(status)), status).toBe(false);
  });
});

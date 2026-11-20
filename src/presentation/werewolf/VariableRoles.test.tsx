import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { emptyFixedDraft } from "../../business/games/werewolf/fixedConfiguration";
import {
  emptyVariableDraft,
  setVariableEntryState,
  setVariableItemState,
  type VariableDraft,
  type VariableState,
} from "../../business/games/werewolf/variableConfiguration";
import { createGameHubI18n } from "../../i18n";
import { WerewolfConfiguration } from "./WerewolfConfiguration";

type Language = "de" | "en";

const put = (draft: VariableDraft, entries: Record<string, VariableState>) =>
  Object.entries(entries).reduce(
    (current, [id, state]) => setVariableEntryState(current, id, state),
    draft,
  );

/** The example of the narrator: eight players, witch, hunter (both options) and Cupid may, the tough guy must. */
const example = put(emptyVariableDraft, {
  cupid: "may",
  "hunter:optional": "may",
  "hunter:required": "may",
  "toughGuy:wolfOnly": "must",
  witch: "may",
});

async function renderVariable(language: Language, players: number, start = emptyVariableDraft) {
  const i18n = await createGameHubI18n(language);
  const latest = { variable: start };
  function Host() {
    const [variable, setVariable] = useState(start);
    latest.variable = variable;
    return (
      <WerewolfConfiguration
        draft={emptyFixedDraft}
        onChange={() => undefined}
        onDone={() => undefined}
        onVariableChange={setVariable}
        players={players}
        variableDraft={variable}
      />
    );
  }
  render(
    <I18nextProvider i18n={i18n}>
      <Host />
    </I18nextProvider>,
  );
  const user = userEvent.setup();
  // The variable view is chosen with the switch at the top.
  await user.click(
    screen.getByRole("radio", { name: language === "en" ? "Variable roles" : "Variable Rollen" }),
  );
  return { latest, user };
}

const roles = { de: "Rollen", en: "Roles" } as const;
const box = (name: string) => screen.getByRole("region", { name });
const chips = (name: string) =>
  [...box(name).querySelectorAll(".ww-chip")].map((chip) => chip.textContent);

it.each([
  ["en", "Must be in the game", "May be in the game", "Should not be in the game"],
  ["de", "Muss ins Spiel", "Darf ins Spiel", "Soll nicht ins Spiel"],
] as const)(
  "shows three boxes for the roles, all in the last one at first (%s)",
  async (language, must, may) => {
    await renderVariable(language, 12);
    expect(chips(`${roles[language]}: ${must}`)).toEqual([]);
    expect(chips(`${roles[language]}: ${may}`)).toEqual([]);
    // Every role that exists for twelve players waits in the box for the roles that should not be in the game.
    const waiting = [
      ...document.querySelectorAll('.ww-vbox[data-kind="role"][data-state="not"] .ww-chip'),
    ];
    expect(waiting.length).toBeGreaterThan(10);
  },
);

it("shows only the roles that exist for the number of players", async () => {
  await renderVariable("en", 8);
  const all = [...document.querySelectorAll(".ww-chip")].map((chip) => chip.textContent);
  expect(all).toContain("Witch");
  expect(all).toContain("Tough guy · Wolf attack only");
  expect(all).not.toContain("Magician");
  expect(all).not.toContain("Paranormal investigator");
  // No box of extras: there are none below nine players.
  expect(document.querySelector('.ww-vbox[data-kind="item"]')).toBeNull();
});

it("puts every option of a role in its box on its own, and the extras in boxes of their own", async () => {
  await renderVariable("en", 12, setVariableItemState(example, "amulet", "may"));
  expect(chips("Roles: Must be in the game")).toContain("Tough guy · Wolf attack only");
  expect(chips("Roles: May be in the game")).toEqual(
    expect.arrayContaining([
      "Hunter · Duty to shoot",
      "Hunter · No duty to shoot",
      "Witch",
      "Cupid",
    ]),
  );
  const extras = [...document.querySelectorAll('.ww-vbox[data-kind="item"]')];
  expect(extras).toHaveLength(3);
  expect(
    [...document.querySelectorAll('.ww-vbox[data-kind="item"][data-state="may"] .ww-chip')].map(
      (chip) => chip.textContent,
    ),
  ).toEqual(["Protective amulet"]);
});

it("shows the number of 'may' roles in a field at the bottom, and what is possible", async () => {
  await renderVariable("en", 8, example);
  const range = screen.getByRole("region", { name: "Special roles from May" });
  expect(within(range).getByText("Possible: 0 to 3")).toBeInTheDocument();
  expect(within(range).getByRole("status", { name: "At least" })).toHaveTextContent("0");
  expect(within(range).getByRole("status", { name: "At most" })).toHaveTextContent("3");
});

it("changes the range with the buttons and keeps it inside what is possible", async () => {
  const { latest, user } = await renderVariable("en", 8, example);
  const range = screen.getByRole("region", { name: "Special roles from May" });
  await user.click(within(range).getByRole("button", { name: "At least: one more" }));
  await user.click(within(range).getByRole("button", { name: "At most: one less" }));
  expect(latest.variable.roleRange).toEqual({ maximum: 2, minimum: 1 });
  expect(within(range).getByRole("button", { name: "At least: one less" })).toBeEnabled();
  // The most cannot go below the least, and not above the possible number.
  await user.click(within(range).getByRole("button", { name: "At most: one less" }));
  expect(within(range).getByRole("button", { name: "At most: one less" })).toBeDisabled();
  expect(within(range).getByRole("button", { name: "At most: one more" })).toBeEnabled();
});

it("says to put roles on May while there is none", async () => {
  await renderVariable("en", 12);
  const range = screen.getByRole("region", { name: "Special roles from May" });
  expect(
    within(range).getByText("Put roles on May to set how many are drawn."),
  ).toBeInTheDocument();
});

it("lets the wolf counts be chosen where the players allow it, with the standard chosen and a recommendation", async () => {
  const { latest, user } = await renderVariable("en", 7);
  const wolves = screen.getByRole("group", { name: "Werewolves" });
  const buttons = within(wolves).getAllByRole("button");
  expect(buttons).toHaveLength(2);
  expect(buttons.filter((button) => button.getAttribute("aria-pressed") === "true")).toHaveLength(
    1,
  );
  expect(wolves.querySelectorAll("[data-recommended]")).toHaveLength(1);
  await user.click(within(wolves).getByRole("button", { name: "2" }));
  expect(latest.variable.wolfCounts).toEqual([1, 2]);
});

it("has the wolf count fixed where the players allow only one", async () => {
  await renderVariable("en", 6);
  const wolves = screen.getByRole("group", { name: "Werewolves" });
  expect(within(wolves).getAllByRole("button")).toHaveLength(1);
  expect(within(wolves).getByRole("button")).toBeDisabled();
});

it("tells that the selection cannot be played when the logic says so", async () => {
  await renderVariable("en", 12, put(emptyVariableDraft, { magician: "must", witch: "must" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "This selection cannot be played with 12 players.",
  );
});

it("keeps the general rules of the variable roles apart from the fixed ones", async () => {
  const { latest, user } = await renderVariable("en", 12);
  await user.click(screen.getByRole("tab", { name: "Game rules" }));
  await user.click(screen.getByRole("radio", { name: "From night 1" }));
  expect(latest.variable.rules.attackOnFirstNight).toBe(true);
});

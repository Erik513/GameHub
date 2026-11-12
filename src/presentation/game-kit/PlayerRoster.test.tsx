import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import type { PlayerRosterStore } from "../../business/shared/playerRoster";
import { createGameHubI18n } from "../../i18n";
import { PlayerRosterButton } from "./PlayerRosterButton";
import { PlayerRosterProvider } from "./PlayerRosterProvider";
import { PlayersSetup } from "./PlayersSetup";
import { RosterPicker } from "./RosterPicker";

function memoryStore(initial: readonly string[] = []) {
  const state = { names: initial };
  const store: PlayerRosterStore = {
    read: () => state.names,
    write: (names) => {
      state.names = names;
    },
  };
  return { state, store };
}

async function renderWith(
  language: "en" | "de",
  store: PlayerRosterStore | undefined,
  children: React.ReactNode,
) {
  const i18n = await createGameHubI18n(language);
  render(
    <I18nextProvider i18n={i18n}>
      <PlayerRosterProvider store={store}>{children}</PlayerRosterProvider>
    </I18nextProvider>,
  );
  return userEvent.setup();
}

const texts = {
  en: {
    open: "Players",
    name: "Name of the player",
    add: "Add",
    list: "Saved players",
    remove: (name: string) => `Remove player ${name}`,
    confirm: (name: string) => `Tap again to remove ${name}`,
    duplicate: "This player exists already.",
    pick: "Choose from player list",
    apply: "Apply",
    cancel: "Cancel",
    all: "Choose all",
    none: "Choose none",
    field: "Player names",
  },
  de: {
    open: "Spieler",
    name: "Name des Spielers",
    add: "Hinzufügen",
    list: "Gespeicherte Spieler",
    remove: (name: string) => `Spieler ${name} entfernen`,
    confirm: (name: string) => `Nochmal tippen, um ${name} zu entfernen`,
    duplicate: "Diesen Spieler gibt es schon.",
    pick: "Aus Spielerliste wählen",
    apply: "Übernehmen",
    cancel: "Abbrechen",
    all: "Alle wählen",
    none: "Keinen wählen",
    field: "Spielernamen",
  },
} as const;

it.each(["en", "de"] as const)(
  "adds and removes saved players in a window and keeps them in the store in %s",
  async (language) => {
    const text = texts[language];
    const { state, store } = memoryStore(["Ben"]);
    const user = await renderWith(language, store, <PlayerRosterButton />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: text.open }));
    const dialog = screen.getByRole("dialog", { name: text.open });
    expect(within(dialog).getByRole("list", { name: text.list })).toHaveTextContent("Ben");

    await user.type(within(dialog).getByRole("textbox", { name: text.name }), "anna{enter}");
    expect(state.names).toEqual(["Anna", "Ben"]);
    expect(
      within(within(dialog).getByRole("list", { name: text.list }))
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Anna", "Ben"]);

    // A name that exists already is refused with a message.
    await user.type(within(dialog).getByRole("textbox", { name: text.name }), "BEN");
    await user.click(within(dialog).getByRole("button", { name: text.add }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent(text.duplicate);
    expect(state.names).toEqual(["Anna", "Ben"]);

    // Removing needs a second tap.
    await user.click(within(dialog).getByRole("button", { name: text.remove("Ben") }));
    expect(state.names).toEqual(["Anna", "Ben"]);
    // After the first tap the button only changes its color and name, it shows no extra text.
    const armed = within(dialog).getByRole("button", { name: text.confirm("Ben") });
    expect(armed).toHaveAttribute("data-armed", "true");
    expect(armed.textContent).toBe("");
    // The delete button sits next to the name, not inside its box.
    expect(armed.closest("li")?.querySelector(".kit-roster__name")?.contains(armed)).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 450));
    await user.click(within(dialog).getByRole("button", { name: text.confirm("Ben") }));
    expect(state.names).toEqual(["Anna"]);
  },
);

it("shows nothing without a player list in the app", async () => {
  await renderWith("en", undefined, <PlayerRosterButton />);
  expect(screen.queryByRole("button", { name: "Players" })).not.toBeInTheDocument();
});

it.each(["en", "de"] as const)(
  "chooses players from the list into the players field in %s",
  async (language) => {
    const text = texts[language];
    const { store } = memoryStore(["Anna", "Ben", "Cara"]);
    function Host() {
      const [value, setValue] = useState("Dora, ben");
      return <PlayersSetup onChange={setValue} value={value} />;
    }
    const user = await renderWith(language, store, <Host />);
    await user.click(screen.getByRole("button", { name: text.pick }));
    const dialog = screen.getByRole("dialog");
    // The players that are in the field already start ticked.
    expect(within(dialog).getByRole("checkbox", { name: "Ben" })).toBeChecked();
    expect(within(dialog).getByRole("checkbox", { name: "Anna" })).not.toBeChecked();

    await user.click(within(dialog).getByRole("checkbox", { name: "Anna" }));
    await user.click(within(dialog).getByRole("checkbox", { name: "Ben" }));
    await user.click(within(dialog).getByRole("button", { name: text.apply }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // Hand-typed Dora stays, deselected Ben goes, ticked Anna is added.
    expect(screen.getByRole("textbox", { name: text.field })).toHaveValue("Dora, Anna");
  },
);

it("can choose all, choose none and cancel without changing the field", async () => {
  const { store } = memoryStore(["Anna", "Ben"]);
  function Host() {
    const [value, setValue] = useState("");
    return <RosterPicker onChange={setValue} value={value} />;
  }
  const user = await renderWith("en", store, <Host />);
  await user.click(screen.getByRole("button", { name: "Choose from player list" }));
  const dialog = screen.getByRole("dialog");
  await user.click(within(dialog).getByRole("button", { name: "Choose all" }));
  expect(
    within(dialog)
      .getAllByRole("checkbox")
      .every((box) => (box as HTMLInputElement).checked),
  ).toBe(true);
  await user.click(within(dialog).getByRole("button", { name: "Choose none" }));
  expect(
    within(dialog)
      .getAllByRole("checkbox")
      .some((box) => (box as HTMLInputElement).checked),
  ).toBe(false);
  await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("tells the player to add players first when the list is empty", async () => {
  const { store } = memoryStore([]);
  const user = await renderWith("en", store, <RosterPicker onChange={() => undefined} value="" />);
  await user.click(screen.getByRole("button", { name: "Choose from player list" }));
  expect(screen.getByRole("dialog")).toHaveTextContent("The player list is empty");
  expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
});

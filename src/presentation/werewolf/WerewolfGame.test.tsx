import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import type { GameSettingsMemory } from "../../business/shared/gameSettingsMemory";
import { createGameHubI18n } from "../../i18n";
import { GameSettingsMemoryProvider } from "../game-kit";
import { createWerewolfModule } from "./werewolfModule";

async function renderGame(language: "en" | "de") {
  const i18n = await createGameHubI18n(language);
  const { Screen } = createWerewolfModule();
  render(
    <I18nextProvider i18n={i18n}>
      <Screen cardLanguage="en" onCardLanguageChange={() => undefined} />
    </I18nextProvider>,
  );
  return userEvent.setup();
}

const addLabel = { de: "Spieler hinzufügen", en: "Add player" } as const;
const names = "Anna, Ben, Cleo, Dora, Emil, Finn, Gina";

async function addPlayers(user: ReturnType<typeof userEvent.setup>, language: "en" | "de") {
  await user.type(screen.getByLabelText(addLabel[language]), `${names}{enter}`);
}

it("is named the module of Werewolf", () => {
  expect(createWerewolfModule().id).toBe("werewolf");
});

const startName = { de: "Spiel starten", en: "Start game" } as const;
const chooseName = { de: /Erzähler\s+wählen/, en: /Choose\s+narrator/ } as const;
const changeName = /Change\s+narrator/;
const seatRows = () => [...document.querySelectorAll(".kit-order__row")];

async function chooseNarrator(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  open: string | RegExp,
) {
  await user.click(screen.getByRole("button", { name: open }));
  await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name }));
}

const startProblems = {
  de: { narrator: /Wähle einen Erzähler/, players: "Füge zuerst Spieler hinzu." },
  en: { narrator: /Choose a narrator/, players: "Add players first." },
} as const;

it.each(["en", "de"] as const)(
  "can always be started, and says what is missing in %s",
  async (language) => {
    const user = await renderGame(language);
    const start = () => screen.getByRole("button", { name: startName[language] });
    expect(start()).toBeEnabled();
    // Without players.
    await user.click(start());
    expect(await screen.findByText(startProblems[language].players)).toBeInTheDocument();
    // Without a narrator.
    await addPlayers(user, language);
    await user.click(start());
    expect(await screen.findByText(startProblems[language].narrator)).toBeInTheDocument();
    // Ready: the game starts with the role reveal of the narrator view; ending it leads back to the line-up.
    await chooseNarrator(user, "Anna", chooseName[language]);
    await user.click(start());
    expect(
      await screen.findByText(
        /Hand the device to this person|Gib das Gerät an diese Person weiter/,
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /End game|Spiel beenden/ }));
    await new Promise((resolve) => setTimeout(resolve, 450));
    await user.click(screen.getByRole("button", { name: /Tap again|Nochmal tippen/ }));
    expect(await screen.findByRole("button", { name: startName[language] })).toBeInTheDocument();
  },
);

it("tells how many players are missing and takes the narrator away again", async () => {
  const user = await renderGame("en");
  await user.type(screen.getByLabelText("Add player"), "Anna, Ben{enter}");
  await chooseNarrator(user, "Anna", chooseName.en);
  await user.click(screen.getByRole("button", { name: "Start game" }));
  expect(await screen.findByText(/At least 6 players are needed/)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: changeName }));
  await user.click(
    within(await screen.findByRole("dialog")).getByRole("button", { name: "No narrator" }),
  );
  expect(screen.getByText("Not chosen yet")).toBeInTheDocument();
});

it("puts the narrator out of the seats and seats the former narrator last", async () => {
  const user = await renderGame("en");
  await addPlayers(user, "en");
  await chooseNarrator(user, "Anna", chooseName.en);
  await user.click(screen.getByRole("tab", { name: "Seats" }));
  expect(seatRows()).toHaveLength(6);
  expect(seatRows()[0]).toHaveTextContent("Ben");
  await user.click(screen.getByRole("tab", { name: /Players/ }));
  await chooseNarrator(user, "Ben", changeName);
  await user.click(screen.getByRole("tab", { name: "Seats" }));
  expect(seatRows()[seatRows().length - 1]).toHaveTextContent("Anna");
});

it("moves a seat with the arrow keys", async () => {
  const user = await renderGame("en");
  await addPlayers(user, "en");
  await chooseNarrator(user, "Anna", chooseName.en);
  await user.click(screen.getByRole("tab", { name: "Seats" }));
  expect(seatRows()[0]).toHaveTextContent("Ben");
  screen.getByRole("button", { name: "Move Ben" }).focus();
  await user.keyboard("{ArrowDown}");
  expect(seatRows()[1]).toHaveTextContent("Ben");
  // The first seat cannot move up.
  screen.getByRole("button", { name: "Move Cleo" }).focus();
  await user.keyboard("{ArrowUp}");
  expect(seatRows()[0]).toHaveTextContent("Cleo");
});

it("shows the full name of a held tile in a box and the hint again when let go", async () => {
  const user = await renderGame("en");
  await addPlayers(user, "en");
  await chooseNarrator(user, "Anna", chooseName.en);
  await user.click(screen.getByRole("tab", { name: "Seats" }));
  await user.click(screen.getByRole("button", { name: "Show seat circle" }));
  const dialog = await screen.findByRole("dialog");
  const box = () => dialog.querySelector(".ww-circle__name");
  expect(box()).toHaveTextContent("Hold a tile to see the full name.");
  const tile = dialog.querySelector<HTMLElement>(".ww-circle__ring .ww-tile");
  expect(tile).not.toBeNull();
  if (!tile) return;
  fireEvent.pointerDown(tile);
  await waitFor(() => expect(box()).toHaveTextContent("Ben"));
  fireEvent.pointerUp(tile);
  expect(box()).toHaveTextContent("Hold a tile");
});

it("seats the first player right next to the narrator, on the left", async () => {
  const user = await renderGame("en");
  await addPlayers(user, "en");
  await chooseNarrator(user, "Anna", chooseName.en);
  await user.click(screen.getByRole("tab", { name: "Seats" }));
  await user.click(screen.getByRole("button", { name: "Show seat circle" }));
  const tiles = [
    ...(await screen.findByRole("dialog")).querySelectorAll<HTMLElement>(
      ".ww-circle__ring .ww-tile",
    ),
  ];
  // The narrator is the last tile, at the bottom; seat 1 is the first tile, left of the narrator.
  const left = (tile: HTMLElement) => Number.parseFloat(tile.style.left);
  const top = (tile: HTMLElement) => Number.parseFloat(tile.style.top);
  const narrator = tiles[tiles.length - 1]!;
  expect(left(narrator)).toBeCloseTo(50);
  expect(left(tiles[0]!)).toBeLessThan(50);
  expect(top(tiles[0]!)).toBeGreaterThan(50);
});

it.each([
  ["en", "Info about the seats", "seat 1 is right next to the narrator"],
  ["de", "Info zu den Sitzplätzen", "Sitz 1 ist direkt links neben dem Erzähler"],
] as const)(
  "explains the seat order in a window of its own in %s",
  async (language, label, text) => {
    const user = await renderGame(language);
    await addPlayers(user, language);
    await chooseNarrator(user, "Anna", chooseName[language]);
    await user.click(screen.getByRole("tab", { name: language === "en" ? "Seats" : "Sitzplätze" }));
    // The explanation is not in the tab itself.
    expect(screen.queryByText(text, { exact: false })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: label }));
    expect(await screen.findByText(text, { exact: false })).toBeInTheDocument();
    // The example circle shows the numbers of six seats and the narrator.
    const example = document.querySelector(".ww-example");
    expect(example?.querySelectorAll(".ww-tile")).toHaveLength(7);
    expect(example?.textContent).toContain("123456");
  },
);

it.each([
  ["en", "Add players first and choose a narrator."],
  ["de", "Füge zuerst Spieler hinzu und lege einen Erzähler fest."],
] as const)("shows the seats only with players and a narrator in %s", async (language, hint) => {
  const user = await renderGame(language);
  const tab = () => screen.getByRole("tab", { name: language === "en" ? "Seats" : "Sitzplätze" });
  await user.click(tab());
  expect(screen.getByText(hint)).toBeInTheDocument();
  await addPlayers(user, language);
  // Players alone are not enough.
  await user.click(tab());
  expect(screen.getByText(hint)).toBeInTheDocument();
  expect(document.querySelector(".kit-order")).toBeNull();
  await user.click(screen.getByRole("tab", { name: /^(Players|Spieler)/ }));
  await chooseNarrator(user, "Anna", chooseName[language]);
  await user.click(tab());
  expect(screen.queryByText(hint)).not.toBeInTheDocument();
  expect(document.querySelector(".kit-order")).not.toBeNull();
});

it.each([
  ["en", "Configuration", "Done", "Hunter", "Duty to shoot", "Players (6-20)"],
  ["de", "Konfiguration", "Fertig", "Jäger", "Schusspflicht", "Spieler (6-20)"],
] as const)(
  "opens the configuration from the line-up and keeps both when going back in %s",
  async (language, open, done, hunter, shot, playersTab) => {
    const user = await renderGame(language);
    await addPlayers(user, language);
    await user.click(screen.getByRole("button", { name: open }));
    await user.click(
      within(screen.getByRole("group", { name: hunter })).getByRole("checkbox", {
        name: `${hunter}, ${shot}`,
      }),
    );
    await user.click(screen.getByRole("button", { name: done }));
    // The line-up is back with its players.
    expect(screen.getByRole("tab", { name: playersTab })).toBeInTheDocument();
    // The choice of the configuration is still there.
    await user.click(screen.getByRole("button", { name: open }));
    expect(
      within(screen.getByRole("group", { name: hunter })).getByRole("checkbox", {
        name: `${hunter}, ${shot}`,
      }),
    ).toBeChecked();
  },
);

it("takes back the roles that no longer fit when a player is removed", async () => {
  const user = await renderGame("en");
  await user.type(
    screen.getByLabelText("Add player"),
    "Anna, Ben, Cleo, Dora, Emil, Finn, Gina, Hans, Ida{enter}",
  );
  await chooseNarrator(user, "Anna", chooseName.en);
  // Eight players besides the narrator: the tanner (from eight players) can be chosen.
  await user.click(screen.getByRole("button", { name: "Configuration" }));
  const tanner = () =>
    within(screen.getByRole("group", { name: "Tanner" })).getByRole("checkbox", {
      name: /Win by vote only/,
    });
  await user.click(tanner());
  expect(tanner()).toBeChecked();
  await user.click(screen.getByRole("button", { name: "Done" }));
  // One player less: seven players, the tanner is taken back, and nothing has to be fixed by hand.
  await user.click(screen.getByRole("button", { name: /Remove Ida/ }));
  await user.click(screen.getByRole("button", { name: "Configuration" }));
  expect(tanner()).not.toBeChecked();
  expect(document.querySelector(".ww-issues")).toBeNull();
});

it("keeps the line-up for the next game", async () => {
  const data = new Map<string, unknown>();
  const memory: GameSettingsMemory = {
    read: (key) => data.get(key),
    write: (key, value) => void data.set(key, value),
  };
  const i18n = await createGameHubI18n("en");
  const { Screen } = createWerewolfModule();
  const view = () => (
    <I18nextProvider i18n={i18n}>
      <GameSettingsMemoryProvider memory={memory}>
        <Screen cardLanguage="en" onCardLanguageChange={() => undefined} />
      </GameSettingsMemoryProvider>
    </I18nextProvider>
  );
  const first = render(view());
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Add player"), "Anna, Ben{enter}");
  expect(data.get("werewolf.lineup")).toMatchObject({ participants: ["Anna", "Ben"] });
  first.unmount();

  render(view());
  expect(screen.getByText("Anna")).toBeInTheDocument();
  expect(screen.getByText("Ben")).toBeInTheDocument();
});

it("counts the people in the players tab: red until a match is possible, then green", async () => {
  const user = await renderGame("en");
  const count = () => screen.getByRole("status", { name: /people \(with the narrator\)/ });
  expect(count()).toHaveTextContent("0/21");
  expect(count()).toHaveAttribute("data-enough", "false");
  // Six people are not enough: six players need the narrator as the seventh.
  await user.type(screen.getByLabelText("Add player"), "Anna, Ben, Cleo, Dora, Emil, Finn{enter}");
  expect(count()).toHaveTextContent("6/21");
  expect(count()).toHaveAttribute("data-enough", "false");
  await user.type(screen.getByLabelText("Add player"), "Gina{enter}");
  expect(count()).toHaveTextContent("7/21");
  expect(count()).toHaveAttribute("data-enough", "true");
});

it("names the count of the people in German", async () => {
  await renderGame("de");
  expect(
    screen.getByRole("status", { name: "0 von 21 Personen (mit Erzähler)" }),
  ).toBeInTheDocument();
});

it("keeps the fixed and the variable roles apart, and the kind of roles", async () => {
  const data = new Map<string, unknown>();
  const memory: GameSettingsMemory = {
    read: (key) => data.get(key),
    write: (key, value) => void data.set(key, value),
  };
  const i18n = await createGameHubI18n("en");
  const { Screen } = createWerewolfModule();
  const view = () => (
    <I18nextProvider i18n={i18n}>
      <GameSettingsMemoryProvider memory={memory}>
        <Screen cardLanguage="en" onCardLanguageChange={() => undefined} />
      </GameSettingsMemoryProvider>
    </I18nextProvider>
  );
  const first = render(view());
  const user = userEvent.setup();
  await user.type(
    screen.getByLabelText("Add player"),
    "Anna, Ben, Cleo, Dora, Emil, Finn, Gina, Hans, Ida, Jan, Kim, Lea{enter}",
  );
  await user.click(screen.getByRole("button", { name: "Configuration" }));
  // A fixed choice first.
  await user.click(screen.getByRole("checkbox", { name: "Cupid" }));
  // Then the variable roles: a role to the box for "may".
  await user.click(screen.getByRole("radio", { name: "Variable roles" }));
  await user.click(screen.getByRole("button", { name: "Witch" }));
  await user.click(
    within(await screen.findByRole("dialog", { name: "Witch" })).getByRole("button", {
      name: "May be in the game",
    }),
  );
  expect(data.get("werewolf.rolesMode")).toBe("variable");
  expect(data.get("werewolf.variableConfiguration")).toMatchObject({ states: { witch: "may" } });
  expect(data.get("werewolf.configuration")).toMatchObject({ roles: ["cupid"] });
  first.unmount();

  // The next game starts with the kind of roles and both drafts as they were.
  render(view());
  await user.click(screen.getByRole("button", { name: "Configuration" }));
  expect(screen.getByRole("radio", { name: "Variable roles" })).toBeChecked();
  expect(
    [...document.querySelectorAll('.ww-vbox[data-state="may"] .ww-chip')].map(
      (chip) => chip.textContent,
    ),
  ).toEqual(["Witch"]);
  await user.click(screen.getByRole("radio", { name: "Fixed roles" }));
  expect(screen.getByRole("checkbox", { name: "Cupid" })).toBeChecked();
});

it("tells the narrator with a notification when a name is added that takes part already", async () => {
  const user = await renderGame("en");
  await user.type(screen.getByLabelText("Add player"), "Anna{enter}");
  expect(screen.queryByText(/is already in/)).toBeNull();
  await user.type(screen.getByLabelText("Add player"), "anna{enter}");
  expect(await screen.findByText("Anna is already in")).toBeInTheDocument();
});

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { createWerewolfModule } from "./werewolfModule";

async function renderGame(language: "en" | "de") {
  const i18n = await createGameHubI18n(language);
  const { Screen } = createWerewolfModule();
  render(
    <I18nextProvider i18n={i18n}>
      <Screen />
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

it.each(["en", "de"] as const)(
  "blocks the start until a narrator is chosen in %s",
  async (language) => {
    const user = await renderGame(language);
    await addPlayers(user, language);
    expect(screen.getByRole("button", { name: startName[language] })).toBeDisabled();
    await chooseNarrator(user, "Anna", chooseName[language]);
    expect(screen.getByRole("button", { name: startName[language] })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: startName[language] }));
    expect(await screen.findByText(/role assignment|Rollenverteilung/)).toBeInTheDocument();
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
  expect(screen.getByRole("button", { name: "Start game" })).toBeDisabled();
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
  await user.click(screen.getByRole("tab", { name: "Seats" }));
  expect(seatRows()[0]).toHaveTextContent("Anna");
  screen.getByRole("button", { name: "Move Anna" }).focus();
  await user.keyboard("{ArrowDown}");
  expect(seatRows()[1]).toHaveTextContent("Anna");
  // The first seat cannot move up.
  screen.getByRole("button", { name: "Move Ben" }).focus();
  await user.keyboard("{ArrowUp}");
  expect(seatRows()[0]).toHaveTextContent("Ben");
});

it("shows the full name of a held tile in a box and the hint again when let go", async () => {
  const user = await renderGame("en");
  await addPlayers(user, "en");
  await user.click(screen.getByRole("tab", { name: "Seats" }));
  await user.click(screen.getByRole("button", { name: "Show seat circle" }));
  const dialog = await screen.findByRole("dialog");
  const box = () => dialog.querySelector(".ww-circle__name");
  expect(box()).toHaveTextContent("Hold a tile to see the full name.");
  const tile = dialog.querySelector<HTMLElement>(".ww-circle__ring .ww-tile");
  expect(tile).not.toBeNull();
  if (!tile) return;
  fireEvent.pointerDown(tile);
  await waitFor(() => expect(box()).toHaveTextContent("Anna"));
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
    await user.click(screen.getByRole("tab", { name: language === "en" ? "Seats" : "Sitzplätze" }));
    // The explanation is not in the tab itself.
    expect(screen.queryByText(text, { exact: false })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: label }));
    expect(await screen.findByText(text, { exact: false })).toBeInTheDocument();
  },
);

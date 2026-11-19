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

it.each([
  ["en", "Narrator: not chosen yet", "Choose a narrator among the participants."],
  ["de", "Erzähler: noch nicht gewählt", "Wähle einen Erzähler unter den Teilnehmern."],
] as const)("starts empty and asks for a narrator in %s", async (language, narrator, issue) => {
  await renderGame(language);
  expect(screen.getByText(narrator, { exact: false })).toBeInTheDocument();
  expect(screen.getByText(issue)).toBeInTheDocument();
});

it.each([
  ["en", "Choose narrator", "Narrator: Anna", "Ready to start."],
  ["de", "Erzähler wählen", "Erzähler: Anna", "Bereit zum Start."],
] as const)(
  "chooses the narrator and is ready with seven participants in %s",
  async (language, choose, summary, ready) => {
    const user = await renderGame(language);
    await addPlayers(user, language);
    await user.click(screen.getByRole("button", { name: choose }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Anna" }));
    expect(screen.getByText(summary, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(ready)).toBeInTheDocument();
    expect(
      screen.getByText(language === "en" ? "6 players" : "6 Spieler", { exact: false }),
    ).toBeInTheDocument();
  },
);

it("tells how many players are missing and removes a player again", async () => {
  const user = await renderGame("en");
  await user.type(screen.getByLabelText("Add player"), "Anna, Ben{enter}");
  await user.click(screen.getByRole("button", { name: "Choose narrator" }));
  await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Anna" }));
  expect(screen.getByText(/At least 6 players are needed/)).toBeInTheDocument();
  // The narrator can be taken away again.
  await user.click(screen.getByRole("button", { name: "Change narrator" }));
  await user.click(
    within(await screen.findByRole("dialog")).getByRole("button", { name: "No narrator" }),
  );
  expect(screen.getByText("Not chosen yet")).toBeInTheDocument();
});

it("puts the narrator out of the seats and seats the former narrator last", async () => {
  const user = await renderGame("en");
  await addPlayers(user, "en");
  await user.click(screen.getByRole("button", { name: "Choose narrator" }));
  await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Anna" }));
  await user.click(screen.getByRole("tab", { name: "Seats" }));
  const rows = () =>
    within(screen.getByRole("list", { name: "Seat order" })).getAllByRole("listitem");
  expect(rows()).toHaveLength(6);
  expect(rows()[0]).toHaveTextContent("Ben");
  await user.click(screen.getByRole("tab", { name: /Players/ }));
  await user.click(screen.getByRole("button", { name: "Change narrator" }));
  await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Ben" }));
  await user.click(screen.getByRole("tab", { name: "Seats" }));
  expect(rows()[rows().length - 1]).toHaveTextContent("Anna");
});

it("moves a seat with the arrow keys and announces it", async () => {
  const user = await renderGame("en");
  await addPlayers(user, "en");
  await user.click(screen.getByRole("tab", { name: "Seats" }));
  const rows = () =>
    within(screen.getByRole("list", { name: "Seat order" })).getAllByRole("listitem");
  expect(rows()[0]).toHaveTextContent("Anna");
  screen.getByRole("button", { name: "Move Anna" }).focus();
  await user.keyboard("{ArrowDown}");
  expect(rows()[1]).toHaveTextContent("Anna");
  expect(screen.getByRole("status")).toHaveTextContent("Anna sits at seat 2 now.");
});

it("shows the name of a held tile and hides it again when let go", async () => {
  const user = await renderGame("en");
  await addPlayers(user, "en");
  await user.click(screen.getByRole("tab", { name: "Seats" }));
  const tile = document.querySelector<HTMLElement>(".ww-circle__ring .ww-tile");
  expect(tile).not.toBeNull();
  if (!tile) return;
  fireEvent.pointerDown(tile);
  await waitFor(() => expect(document.querySelector(".ww-circle__name")).toHaveTextContent("Anna"));
  fireEvent.pointerUp(tile);
  expect(document.querySelector(".ww-circle__name")?.textContent?.trim()).toBe("");
});

it("answers the start with the first missing thing, or with the note that more follows", async () => {
  const user = await renderGame("en");
  await user.click(screen.getByRole("button", { name: "Start game" }));
  expect(await screen.findAllByText("Choose a narrator among the participants.")).not.toHaveLength(
    0,
  );
});

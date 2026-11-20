import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { PlayerAdder } from "./PlayerAdder";

async function renderAdder(room: number | undefined, onAdd: (input: string) => void) {
  const i18n = await createGameHubI18n("en");
  render(
    <I18nextProvider i18n={i18n}>
      <PlayerAdder onAdd={onAdd} {...(room === undefined ? {} : { room })} />
    </I18nextProvider>,
  );
  return userEvent.setup();
}

it("adds all names when there is no limit", async () => {
  const added: string[] = [];
  const user = await renderAdder(undefined, (input) => added.push(input));
  await user.type(screen.getByRole("textbox", { name: "Add player" }), "Anna, Ben, Cleo{enter}");
  expect(added).toEqual(["Anna, Ben, Cleo"]);
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

it("adds only the names that fit and says that the others were left out", async () => {
  const added: string[] = [];
  const user = await renderAdder(2, (input) => added.push(input));
  await user.type(screen.getByRole("textbox", { name: "Add player" }), "Anna, Ben, Cleo{enter}");
  expect(added).toEqual(["Anna, Ben"]);
  expect(screen.getByRole("status")).toHaveTextContent("Only 2 of 3 names added");
});

it("switches the field off when there is no room left", async () => {
  await renderAdder(0, () => undefined);
  expect(screen.getByRole("textbox", { name: "Add player" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
});

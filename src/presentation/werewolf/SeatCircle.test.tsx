import { fireEvent, render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { expect, it } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { SeatCircle } from "./SeatCircle";

const seats = ["Anna", "Ben", "Cleo"];

async function renderCircle(language: "en" | "de" = "en") {
  const i18n = await createGameHubI18n(language);
  const view = render(
    <I18nextProvider i18n={i18n}>
      <SeatCircle narrator="Max" seats={seats} />
    </I18nextProvider>,
  );
  const ring = view.container.querySelector<HTMLElement>(".ww-circle__ring")!;
  const tile = (name: string) => ring.querySelector<HTMLElement>(`[data-seat-name="${name}"]`)!;
  const box = () => view.container.querySelector(".ww-circle__name")!;
  return { box, ring, tile };
}

it("shows the full name of a tile with a tap and keeps it", async () => {
  const { box, tile } = await renderCircle();
  expect(box()).not.toHaveAttribute("data-selected");
  fireEvent.click(tile("Anna"));
  expect(box()).toHaveTextContent("Anna");
  expect(box()).toHaveAttribute("data-selected");
  expect(tile("Anna")).toHaveAttribute("data-selected");
});

it("moves the choice to another tile with a tap on it, the narrator included", async () => {
  const { box, tile } = await renderCircle();
  fireEvent.click(tile("Anna"));
  fireEvent.click(tile("Ben"));
  expect(box()).toHaveTextContent("Ben");
  expect(tile("Ben")).toHaveAttribute("data-selected");
  expect(tile("Anna")).not.toHaveAttribute("data-selected");
  fireEvent.click(tile("Max"));
  expect(box()).toHaveTextContent("Max");
});

it("clears the choice with a second tap on the same tile", async () => {
  const { box, tile } = await renderCircle();
  fireEvent.click(tile("Cleo"));
  fireEvent.click(tile("Cleo"));
  expect(box()).not.toHaveAttribute("data-selected");
  expect(tile("Cleo")).not.toHaveAttribute("data-selected");
  expect(box()).toHaveTextContent("Tap a tile to see the full name.");
});

it("keeps the choice when the tap lands beside the tiles", async () => {
  const { box, ring, tile } = await renderCircle();
  fireEvent.click(tile("Ben"));
  fireEvent.click(ring);
  expect(box()).toHaveTextContent("Ben");
});

it("says how the circle works in both languages", async () => {
  const english = await renderCircle("en");
  expect(english.box()).toHaveTextContent("Tap it again to clear the choice.");
  document.body.innerHTML = "";
  const german = await renderCircle("de");
  expect(german.box()).toHaveTextContent("Erneutes Tippen hebt die Auswahl auf.");
});

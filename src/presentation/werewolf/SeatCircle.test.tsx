import { act, fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createGameHubI18n } from "../../i18n";
import { SeatCircle } from "./SeatCircle";

const seats = ["Anna", "Ben", "Cleo"];

async function renderCircle() {
  const i18n = await createGameHubI18n("en");
  const view = render(
    <I18nextProvider i18n={i18n}>
      <SeatCircle narrator="Max" seats={seats} />
    </I18nextProvider>,
  );
  const ring = view.container.querySelector<HTMLElement>(".ww-circle__ring")!;
  const tile = (name: string) => ring.querySelector<HTMLElement>(`[data-seat-name="${name}"]`)!;
  // The browser says which tile lies under a point; jsdom has no layout, so the points are made up here.
  const under = new Map<string, HTMLElement | null>([
    ["1,1", tile("Anna")],
    ["2,2", tile("Ben")],
    ["3,3", tile("Max")],
    ["9,9", null],
  ]);
  document.elementFromPoint = (x: number, y: number) => under.get(`${x},${y}`) ?? null;
  const box = () => view.container.querySelector(".ww-circle__name")!;
  return { box, ring, tile };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it("shows the name of a tile only after it is held for a moment", async () => {
  const { box, ring } = await renderCircle();
  fireEvent.pointerDown(ring, { clientX: 1, clientY: 1 });
  expect(box()).not.toHaveAttribute("data-held");
  act(() => void vi.advanceTimersByTime(250));
  expect(box()).toHaveTextContent("Anna");
  fireEvent.pointerUp(ring);
  expect(box()).not.toHaveAttribute("data-held");
});

it("does not show a name for a quick tap", async () => {
  const { box, ring } = await renderCircle();
  fireEvent.pointerDown(ring, { clientX: 1, clientY: 1 });
  act(() => void vi.advanceTimersByTime(100));
  fireEvent.pointerUp(ring);
  act(() => void vi.advanceTimersByTime(500));
  expect(box()).not.toHaveAttribute("data-held");
});

it("follows the finger from tile to tile while it stays down", async () => {
  const { box, ring, tile } = await renderCircle();
  fireEvent.pointerDown(ring, { clientX: 1, clientY: 1 });
  act(() => void vi.advanceTimersByTime(250));
  expect(box()).toHaveTextContent("Anna");
  expect(tile("Anna")).toHaveAttribute("data-held");
  // Over another tile the name changes at once, without letting go.
  fireEvent.pointerMove(ring, { clientX: 2, clientY: 2 });
  expect(box()).toHaveTextContent("Ben");
  expect(tile("Ben")).toHaveAttribute("data-held");
  expect(tile("Anna")).not.toHaveAttribute("data-held");
  // The narrator is a tile like the others.
  fireEvent.pointerMove(ring, { clientX: 3, clientY: 3 });
  expect(box()).toHaveTextContent("Max");
  // Between two tiles the last name stays.
  fireEvent.pointerMove(ring, { clientX: 9, clientY: 9 });
  expect(box()).toHaveTextContent("Max");
  fireEvent.pointerUp(ring);
  expect(box()).not.toHaveAttribute("data-held");
});

it("shows nothing when the finger moves before the name has appeared and is let go", async () => {
  const { box, ring } = await renderCircle();
  fireEvent.pointerDown(ring, { clientX: 1, clientY: 1 });
  fireEvent.pointerMove(ring, { clientX: 2, clientY: 2 });
  expect(box()).not.toHaveAttribute("data-held");
  fireEvent.pointerUp(ring);
  act(() => void vi.advanceTimersByTime(500));
  expect(box()).not.toHaveAttribute("data-held");
});

it("shows the name of the tile under the finger when the time is up, wherever it moved before", async () => {
  const { box, ring } = await renderCircle();
  fireEvent.pointerDown(ring, { clientX: 1, clientY: 1 });
  fireEvent.pointerMove(ring, { clientX: 2, clientY: 2 });
  act(() => void vi.advanceTimersByTime(250));
  expect(box()).toHaveTextContent("Ben");
});

it("stops when the finger leaves the circle or the touch is cancelled", async () => {
  const { box, ring } = await renderCircle();
  fireEvent.pointerDown(ring, { clientX: 1, clientY: 1 });
  act(() => void vi.advanceTimersByTime(250));
  fireEvent.pointerLeave(ring);
  expect(box()).not.toHaveAttribute("data-held");
  fireEvent.pointerDown(ring, { clientX: 2, clientY: 2 });
  act(() => void vi.advanceTimersByTime(250));
  expect(box()).toHaveTextContent("Ben");
  fireEvent.pointerCancel(ring);
  expect(box()).not.toHaveAttribute("data-held");
  expect(screen.queryByText("Ben", { selector: ".ww-circle__name" })).toBeNull();
});

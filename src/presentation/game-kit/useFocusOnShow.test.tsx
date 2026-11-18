import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, it } from "vitest";
import { useFocusOnShow } from "./useFocusOnShow";

function View({ shown = true }: { shown?: boolean }) {
  const focus = useFocusOnShow<HTMLElement>(shown);
  return (
    <section aria-label="View" ref={focus} tabIndex={-1}>
      <button type="button">Inside</button>
    </section>
  );
}

it("moves the focus to the view when it appears and the focus was lost", () => {
  render(<View />);
  expect(screen.getByRole("region", { name: "View" })).toHaveFocus();
});

it("keeps the place of somebody who is typing somewhere else", () => {
  const field = document.createElement("input");
  document.body.append(field);
  field.focus();
  render(<View />);
  expect(field).toHaveFocus();
  field.remove();
});

it("moves the focus when the focus sits in a part of the page that is hidden now", () => {
  const hidden = document.createElement("div");
  hidden.hidden = true;
  const field = document.createElement("input");
  hidden.append(field);
  document.body.append(hidden);
  // A browser would drop the focus from a hidden field; the test leaves it there.
  Object.defineProperty(document, "activeElement", { configurable: true, get: () => field });
  render(<View />);
  Reflect.deleteProperty(document, "activeElement");
  expect(screen.getByRole("region", { name: "View" })).toHaveFocus();
  hidden.remove();
});

it("moves the focus when a hidden view is shown, not before", () => {
  function Host() {
    const [shown, setShown] = useState(false);
    return (
      <>
        <button onClick={() => setShown(true)} type="button">
          Show
        </button>
        <View shown={shown} />
      </>
    );
  }
  render(<Host />);
  expect(screen.getByRole("region", { name: "View" })).not.toHaveFocus();
  fireEvent.click(screen.getByRole("button", { name: "Show" }));
  expect(screen.getByRole("region", { name: "View" })).toHaveFocus();
});

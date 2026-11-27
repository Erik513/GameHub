import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { TabPane } from "./TabPane";

const list = (
  <ul>
    <li>Anna</li>
    <li>Ben</li>
  </ul>
);

it("keeps the header and the footer outside of the scrolling body", () => {
  render(
    <TabPane footer={<p>Footer</p>} header={<p>Header</p>}>
      {list}
    </TabPane>,
  );
  const body = document.querySelector(".kit-pane__body")!;
  expect(body).toContainElement(screen.getByText("Anna"));
  expect(body).not.toContainElement(screen.getByText("Header"));
  expect(body).not.toContainElement(screen.getByText("Footer"));
});

it("marks a body with a list of equal rows, which is cut at whole rows", () => {
  render(<TabPane wholeRows>{list}</TabPane>);
  expect(document.querySelector(".kit-pane__body")).toHaveAttribute("data-whole-rows");
  // Without a layout (jsdom) nothing is limited, so the list shows completely.
  expect(document.querySelector<HTMLElement>(".kit-pane__body")?.style.maxHeight).toBe("");
});

it("does not mark an ordinary body", () => {
  render(<TabPane>{list}</TabPane>);
  expect(document.querySelector(".kit-pane__body")).not.toHaveAttribute("data-whole-rows");
});

it("shows no scrollbar when the content only stands over by a rounding, but scrolls when it really does not fit", () => {
  const sizes = (scrollHeight: number) => {
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get() {
        return (this as HTMLElement).classList.contains("kit-pane__body") ? scrollHeight : 0;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get() {
        return (this as HTMLElement).classList.contains("kit-pane__body") ? 400 : 0;
      },
    });
  };
  try {
    sizes(401);
    const { unmount } = render(<TabPane>{list}</TabPane>);
    expect(document.querySelector(".kit-pane__body")).toHaveAttribute("data-snug", "true");
    unmount();
    sizes(450);
    render(<TabPane>{list}</TabPane>);
    expect(document.querySelector(".kit-pane__body")).not.toHaveAttribute("data-snug");
  } finally {
    Reflect.deleteProperty(HTMLElement.prototype, "scrollHeight");
    Reflect.deleteProperty(HTMLElement.prototype, "clientHeight");
  }
});

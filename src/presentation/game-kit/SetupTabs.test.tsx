import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it, vi } from "vitest";
import { SetupTabs } from "./SetupTabs";

const tabs = [
  { content: <input aria-label="First field" />, id: "one", label: "One" },
  { content: <input aria-label="Second field" />, id: "two", label: "Two" },
  { content: <input aria-label="Third field" />, id: "three", label: "Three" },
] as const;

const selected = () =>
  screen.getAllByRole("tab").find((tab) => tab.getAttribute("aria-selected") === "true")
    ?.textContent;

it("shows the first tab at first, or the one that is asked for", () => {
  const { unmount } = render(<SetupTabs ariaLabel="Parts" tabs={tabs} />);
  expect(screen.getByRole("tablist", { name: "Parts" })).toBeVisible();
  expect(selected()).toBe("One");
  unmount();
  render(<SetupTabs ariaLabel="Parts" initial="three" tabs={tabs} />);
  expect(selected()).toBe("Three");
});

it("keeps the content of every tab in the page and links tabs and panels", () => {
  render(<SetupTabs ariaLabel="Parts" tabs={tabs} />);
  // A form reads all fields, also those of the tabs that are not shown.
  expect(screen.getAllByRole("tabpanel")).toHaveLength(3);
  expect(screen.getByLabelText("Second field")).toBeInTheDocument();
  const panels = [...document.querySelectorAll(".kit-tabpanel")];
  expect(panels.map((panel) => panel.getAttribute("data-active"))).toEqual([
    "true",
    "false",
    "false",
  ]);
  for (const tab of screen.getAllByRole("tab")) {
    const panel = document.getElementById(tab.getAttribute("aria-controls") ?? "");
    expect(panel?.getAttribute("aria-labelledby")).toBe(tab.id);
  }
  // The tabs never submit the form they are in.
  expect(screen.getAllByRole("tab").every((tab) => tab.getAttribute("type") === "button")).toBe(
    true,
  );
});

it("moves with the arrow keys one tab at a time and around the ends", async () => {
  const user = userEvent.setup();
  render(<SetupTabs ariaLabel="Parts" tabs={tabs} />);
  screen.getByRole("tab", { name: "One" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(selected()).toBe("Two");
  await user.keyboard("{ArrowRight}");
  expect(selected()).toBe("Three");
  await user.keyboard("{ArrowRight}");
  expect(selected()).toBe("One");
  await user.keyboard("{ArrowLeft}");
  expect(selected()).toBe("Three");
  await user.keyboard("{ArrowLeft}");
  expect(selected()).toBe("Two");
  await user.keyboard("{End}");
  expect(selected()).toBe("Three");
  await user.keyboard("{Home}");
  expect(selected()).toBe("One");
  expect(screen.getByRole("tab", { name: "One" })).toHaveFocus();
});

it("can be controlled from outside and reports the tab that was chosen", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  function Host() {
    const [tab, setTab] = useState("two");
    return (
      <SetupTabs
        ariaLabel="Parts"
        onSelect={(id) => {
          onSelect(id);
          setTab(id);
        }}
        selected={tab}
        tabs={tabs}
      />
    );
  }
  render(<Host />);
  expect(selected()).toBe("Two");
  await user.click(screen.getByRole("tab", { name: "Three" }));
  expect(onSelect).toHaveBeenCalledWith("three");
  expect(selected()).toBe("Three");
});

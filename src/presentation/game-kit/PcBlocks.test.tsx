import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { desktopMediaQuery, useIsDesktop } from "./desktopLayout";
import { ShortcutHint } from "./ShortcutHint";
import { SplitScreen } from "./SplitScreen";
import { duplicateShortcutKeys, useShortcuts, type Shortcut } from "./useShortcuts";

afterEach(() => {
  Reflect.deleteProperty(window, "matchMedia");
});

/** A window whose width can be changed in the test. */
function mockWindowWidth(initial: boolean) {
  let matches = initial;
  const listeners = new Set<() => void>();
  window.matchMedia = vi.fn((query: string) => ({
    get matches() {
      return query === desktopMediaQuery && matches;
    },
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  })) as unknown as typeof window.matchMedia;
  return (next: boolean) => {
    matches = next;
    act(() => listeners.forEach((listener) => listener()));
  };
}

function Width() {
  return <p>{useIsDesktop() ? "desktop" : "phone"}</p>;
}

describe("useIsDesktop", () => {
  it("is false without a window that can say its width", () => {
    render(<Width />);
    expect(screen.getByText("phone")).toBeVisible();
  });

  it("follows the width of the window", () => {
    const resize = mockWindowWidth(false);
    render(<Width />);
    expect(screen.getByText("phone")).toBeVisible();
    resize(true);
    expect(screen.getByText("desktop")).toBeVisible();
    resize(false);
    expect(screen.getByText("phone")).toBeVisible();
  });

  it("starts with the PC layout in a wide window", () => {
    mockWindowWidth(true);
    render(<Width />);
    expect(screen.getByText("desktop")).toBeVisible();
  });
});

describe("SplitScreen", () => {
  it("shows both areas and the main action below them, named for screen readers", () => {
    render(
      <SplitScreen
        end={<p>Right</p>}
        footer={<button type="button">Start</button>}
        label="Setup"
        start={<p>Left</p>}
      />,
    );
    const screenArea = screen.getByRole("region", { name: "Setup" });
    expect(screenArea).toHaveClass("kit-split", "kit-onepage");
    expect(screen.getByText("Left").parentElement).toHaveClass("kit-split__area--start");
    expect(screen.getByText("Right").parentElement).toHaveClass("kit-split__area--end");
    expect(screen.getByRole("button", { name: "Start" }).parentElement).toHaveClass(
      "kit-split__footer",
    );
  });

  it("needs no footer", () => {
    const { container } = render(<SplitScreen end={<p>B</p>} label="Two" start={<p>A</p>} />);
    expect(container.querySelector(".kit-split__footer")).toBeNull();
  });
});

describe("ShortcutHint", () => {
  it("shows the key but is not read by screen readers", () => {
    render(<ShortcutHint label="Space" />);
    const hint = screen.getByText("Space");
    expect(hint.tagName).toBe("KBD");
    expect(hint).toHaveAttribute("aria-hidden", "true");
    expect(hint).toHaveClass("kit-shortcut-hint");
  });
});

describe("duplicateShortcutKeys", () => {
  const shortcut = (...keys: string[]): Shortcut => ({ keys, run: () => undefined });

  it("names every key that more than one shortcut claims, whatever its case", () => {
    expect(duplicateShortcutKeys([shortcut("s"), shortcut("v"), shortcut("p")])).toEqual([]);
    expect(
      duplicateShortcutKeys([shortcut(" ", "Enter"), shortcut("S"), shortcut("s", "Enter")]),
    ).toEqual(["s", "Enter"]);
  });
});

describe("useShortcuts", () => {
  function Screen({ enabled = true, calls }: { enabled?: boolean; calls: string[] }) {
    useShortcuts(
      [
        { keys: [" ", "Enter"], run: () => calls.push("correct") },
        { keys: ["s"], run: () => calls.push("skip") },
        { keys: ["v"], run: () => calls.push("forbidden") },
      ],
      enabled,
    );
    return (
      <>
        <button type="button">Some button</button>
        <input aria-label="Name" />
        <textarea aria-label="Note" />
        <a href="#x">A link</a>
      </>
    );
  }

  it("runs the shortcut of a key once, whatever the case of the letter", () => {
    const calls: string[] = [];
    render(<Screen calls={calls} />);
    fireEvent.keyDown(document.body, { key: "s" });
    fireEvent.keyDown(document.body, { key: "S" });
    fireEvent.keyDown(document.body, { key: " " });
    fireEvent.keyDown(document.body, { key: "Enter" });
    fireEvent.keyDown(document.body, { key: "x" });
    expect(calls).toEqual(["skip", "skip", "correct", "correct"]);
  });

  it("keeps the page from scrolling on the space bar", () => {
    render(<Screen calls={[]} />);
    const prevented = !fireEvent.keyDown(document.body, { key: " " });
    expect(prevented).toBe(true);
    const unknown = !fireEvent.keyDown(document.body, { key: "x" });
    expect(unknown).toBe(false);
  });

  it("does nothing while somebody types, while a window is open or with a held key", () => {
    const calls: string[] = [];
    render(<Screen calls={calls} />);
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Name" }), { key: "s" });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Note" }), { key: " " });
    fireEvent.keyDown(document.body, { key: "s", ctrlKey: true });
    fireEvent.keyDown(document.body, { key: "s", altKey: true });
    fireEvent.keyDown(document.body, { key: "s", metaKey: true });
    fireEvent.keyDown(document.body, { key: "s", repeat: true });
    const dialog = document.createElement("section");
    dialog.setAttribute("role", "dialog");
    document.body.append(dialog);
    fireEvent.keyDown(document.body, { key: "s" });
    dialog.remove();
    expect(calls).toEqual([]);
  });

  it("leaves the space bar and Enter to a button or link that has the focus, but not the letters", () => {
    const calls: string[] = [];
    render(<Screen calls={calls} />);
    const button = screen.getByRole("button", { name: "Some button" });
    fireEvent.keyDown(button, { key: " " });
    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.keyDown(screen.getByRole("link", { name: "A link" }), { key: "Enter" });
    expect(calls).toEqual([]);
    fireEvent.keyDown(button, { key: "v" });
    expect(calls).toEqual(["forbidden"]);
  });

  it("ignores a key that was already handled, and is switched off by `enabled`", () => {
    const calls: string[] = [];
    const { rerender } = render(<Screen calls={calls} />);
    const handled = new KeyboardEvent("keydown", { key: "s", cancelable: true });
    handled.preventDefault();
    window.dispatchEvent(handled);
    expect(calls).toEqual([]);
    rerender(<Screen calls={calls} enabled={false} />);
    fireEvent.keyDown(document.body, { key: "s" });
    expect(calls).toEqual([]);
    rerender(<Screen calls={calls} />);
    fireEvent.keyDown(document.body, { key: "s" });
    expect(calls).toEqual(["skip"]);
  });

  it("uses the latest shortcuts without being set up again", () => {
    const first: string[] = [];
    const second: string[] = [];
    const { rerender } = render(<Screen calls={first} />);
    rerender(<Screen calls={second} />);
    fireEvent.keyDown(document.body, { key: "s" });
    expect(first).toEqual([]);
    expect(second).toEqual(["skip"]);
  });
});

import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useScreenScroll } from "./useScreenScroll";

function Screen({ name, remember }: { name: string; remember?: readonly string[] }) {
  useScreenScroll(name, remember);
  return null;
}

function scrollTo(position: number) {
  Object.defineProperty(window, "scrollY", { configurable: true, value: position });
  act(() => void window.dispatchEvent(new Event("scroll")));
}

const scrollToSpy = vi.fn();

beforeEach(() => {
  window.scrollTo = scrollToSpy;
  scrollToSpy.mockClear();
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
});

afterEach(() => {
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
});

it("starts a new screen at the top and shows a remembered screen where it was left", () => {
  const remember = ["setup"];
  const { rerender } = render(<Screen name="setup" remember={remember} />);
  // Nothing to do while the first screen is shown.
  expect(scrollToSpy).not.toHaveBeenCalled();

  scrollTo(420);
  rerender(<Screen name="cards" remember={remember} />);
  expect(scrollToSpy).toHaveBeenLastCalledWith(0, 0);

  // On the other screen the player scrolls a bit; this does not change what was kept for the setup.
  scrollTo(90);
  rerender(<Screen name="setup" remember={remember} />);
  expect(scrollToSpy).toHaveBeenLastCalledWith(0, 420);
});

it("does not remember screens that are not in the list", () => {
  const { rerender } = render(<Screen name="setup" remember={["setup"]} />);
  rerender(<Screen name="round" remember={["setup"]} />);
  scrollTo(300);
  rerender(<Screen name="overview" remember={["setup"]} />);
  rerender(<Screen name="round" remember={["setup"]} />);
  expect(scrollToSpy).toHaveBeenLastCalledWith(0, 0);
});

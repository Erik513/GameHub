import { render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { StartBar } from "./StartBar";

afterEach(() => vi.restoreAllMocks());

it("tells the notifications how high its top edge is and takes it back when it goes", () => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    top: window.innerHeight - 90,
  } as DOMRect);
  const { unmount } = render(<StartBar>start</StartBar>);
  expect(document.documentElement.style.getPropertyValue("--toast-lift")).toBe("90px");
  unmount();
  expect(document.documentElement.style.getPropertyValue("--toast-lift")).toBe("");
});

it("leaves the notifications alone when there is no layout", () => {
  const { unmount } = render(<StartBar sideAction={<span>side</span>}>start</StartBar>);
  expect(document.documentElement.style.getPropertyValue("--toast-lift")).toBe("");
  unmount();
});

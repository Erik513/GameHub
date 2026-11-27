import { afterEach, expect, it } from "vitest";
import { scrollAreaOf } from "./usePlayerDrag";

function box(overflow: string, scrollHeight: number, clientHeight: number) {
  const element = document.createElement("div");
  element.style.overflowY = overflow;
  Object.defineProperty(element, "scrollHeight", { value: scrollHeight });
  Object.defineProperty(element, "clientHeight", { value: clientHeight });
  return element;
}

afterEach(() => {
  document.body.innerHTML = "";
});

it("finds the nearest box around a dragged name that can scroll", () => {
  const page = box("auto", 2000, 800);
  const pane = box("auto", 900, 400);
  const group = box("visible", 300, 300);
  const name = document.createElement("button");
  group.append(name);
  pane.append(group);
  page.append(pane);
  document.body.append(page);
  expect(scrollAreaOf(name)).toBe(pane);
});

it("skips a box that could scroll but has nothing to scroll, and finds none when no box scrolls", () => {
  const full = box("auto", 400, 400);
  const name = document.createElement("button");
  full.append(name);
  document.body.append(full);
  expect(scrollAreaOf(name)).toBeUndefined();
  expect(scrollAreaOf(null)).toBeUndefined();
});

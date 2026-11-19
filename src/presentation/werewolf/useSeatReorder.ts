import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

/** Near the top or the bottom edge of the box of the tab it scrolls while a name is dragged. */
const scrollEdge = 56;
const scrollStep = 12;

interface SeatReorderOptions {
  /** A player was moved to the seat with this index (counted from 0). */
  readonly onMove: (name: string, toIndex: number) => void;
}

/**
 * Moving a name in the list of seats: with a finger or the mouse (pointer events, so it works on a
 * phone), or with the arrow keys on the handle of a name (up and down). The rows of the list carry
 * `data-seat-row` in the order of the seats. While a name is dragged, the list reorders live.
 */
export function useSeatReorder({ onMove }: SeatReorderOptions) {
  const [dragging, setDragging] = useState<string>();
  const latestMove = useRef(onMove);
  useEffect(() => {
    latestMove.current = onMove;
  });

  /** The properties of the handle of the name `name`, which sits on seat `index` now. */
  function handleProps(name: string, index: number) {
    return {
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
        event.preventDefault();
        latestMove.current(name, index + (event.key === "ArrowUp" ? -1 : 1));
      },
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (event.button !== 0) return;
        event.preventDefault();
        setDragging(name);
        let pointerY = event.clientY;
        let frame = 0;

        const rows = () => [...document.querySelectorAll<HTMLElement>("[data-seat-row]")];
        const place = () => {
          const list = rows();
          let target = list.findIndex((row) => {
            const box = row.getBoundingClientRect();
            return pointerY < box.top + box.height / 2;
          });
          if (target === -1) target = list.length - 1;
          latestMove.current(name, target);
        };
        // Held near the edge of the box, the box scrolls on; the name is placed again after that.
        const scrollNearEdge = () => {
          const panel = document.querySelector<HTMLElement>(".kit-tabpanel[data-active='true']");
          const box = panel?.getBoundingClientRect();
          if (panel && box) {
            if (pointerY < box.top + scrollEdge) panel.scrollBy(0, -scrollStep);
            else if (pointerY > box.bottom - scrollEdge) panel.scrollBy(0, scrollStep);
            else {
              frame = requestAnimationFrame(scrollNearEdge);
              return;
            }
            place();
          }
          frame = requestAnimationFrame(scrollNearEdge);
        };
        const move = (next: globalThis.PointerEvent) => {
          pointerY = next.clientY;
          place();
        };
        const end = () => {
          cancelAnimationFrame(frame);
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", end);
          window.removeEventListener("pointercancel", end);
          setDragging(undefined);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", end);
        window.addEventListener("pointercancel", end);
        frame = requestAnimationFrame(scrollNearEdge);
      },
    };
  }

  return { dragging, handleProps };
}

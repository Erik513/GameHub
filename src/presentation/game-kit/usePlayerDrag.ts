import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

/** Where a dragged player can be dropped: into the team with this number, or out of any team. */
export type DropTarget = number | "none";

/** A player that is being dragged and where the pointer is. */
export interface DragState {
  readonly player: string;
  readonly x: number;
  readonly y: number;
}

/** The attribute that marks an element as a drop field: `data-drop="0"` or `data-drop="none"`. */
export const dropAttribute = "data-drop";

/** How far the pointer must move before a press counts as a drag and not as a tap. */
const dragThreshold = 6;
/** Near the top or the bottom of the screen the page scrolls while a player is dragged. */
const scrollEdge = 80;
/** The bottom edge is higher, because the start bar covers the lower part of the screen. */
const scrollEdgeBottom = 140;
const scrollStep = 14;

function targetAt(x: number, y: number): DropTarget | undefined {
  const field = document.elementFromPoint(x, y)?.closest<HTMLElement>(`[${dropAttribute}]`);
  const value = field?.getAttribute(dropAttribute);
  if (value === null || value === undefined) return undefined;
  if (value === "none") return "none";
  const team = Number(value);
  return Number.isInteger(team) ? team : undefined;
}

interface PlayerDragOptions {
  /** A player was dropped on a field. */
  readonly onDrop: (player: string, target: DropTarget) => void;
  /** A player was tapped without dragging. */
  readonly onTap: (player: string) => void;
}

/**
 * Dragging of players with the mouse or a finger (pointer events, so it works on a phone, too).
 * Put `startDrag(player)` on the pointer-down of a player's name, give the fields where players
 * can be dropped the attribute `data-drop`, and show `drag` as a name that follows the pointer.
 * `over` is the field under the pointer, for highlighting. A press that does not move is a tap.
 */
export function usePlayerDrag({ onDrop, onTap }: PlayerDragOptions) {
  const [drag, setDrag] = useState<DragState>();
  const [over, setOver] = useState<DropTarget>();
  const justDragged = useRef(false);

  function startDrag(player: string) {
    return (event: ReactPointerEvent) => {
      if (event.button !== 0) return;
      const originX = event.clientX;
      const originY = event.clientY;
      let dragging = false;
      let latest = { x: originX, y: originY };
      let frame = 0;

      // Scrolls the page while the pointer is held near the top or the bottom, so teams that are
      // out of sight can be reached, and looks again which field is under the pointer.
      const scrollNearEdge = () => {
        // On a one-page screen the box of the tab scrolls, otherwise the page does.
        const panel = document.querySelector<HTMLElement>(
          '.kit-onepage .kit-tabpanel[data-active="true"]',
        );
        const bounds = panel?.getBoundingClientRect();
        const top = bounds ? bounds.top + scrollEdge : scrollEdge;
        const bottom = bounds ? bounds.bottom - scrollEdge : window.innerHeight - scrollEdgeBottom;
        const by = (dy: number) => (panel ? panel.scrollBy(0, dy) : window.scrollBy(0, dy));
        if (latest.y < top) by(-scrollStep);
        else if (latest.y > bottom) by(scrollStep);
        else {
          frame = requestAnimationFrame(scrollNearEdge);
          return;
        }
        setOver(targetAt(latest.x, latest.y));
        frame = requestAnimationFrame(scrollNearEdge);
      };

      const move = (moved: PointerEvent) => {
        if (
          !dragging &&
          Math.hypot(moved.clientX - originX, moved.clientY - originY) < dragThreshold
        )
          return;
        if (!dragging) frame = requestAnimationFrame(scrollNearEdge);
        dragging = true;
        latest = { x: moved.clientX, y: moved.clientY };
        setDrag({ player, x: moved.clientX, y: moved.clientY });
        setOver(targetAt(moved.clientX, moved.clientY));
      };
      const finish = (ended: PointerEvent, dropped: boolean) => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", cancel);
        cancelAnimationFrame(frame);
        if (!dragging) return;
        setDrag(undefined);
        setOver(undefined);
        // The click that follows the release must not count as a tap.
        justDragged.current = true;
        setTimeout(() => (justDragged.current = false), 0);
        const target = dropped ? targetAt(ended.clientX, ended.clientY) : undefined;
        if (target !== undefined) onDrop(player, target);
      };
      const up = (ended: PointerEvent) => finish(ended, true);
      const cancel = (ended: PointerEvent) => finish(ended, false);

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", cancel);
    };
  }

  /** The click handler of a name: a tap, unless the press was a drag. */
  function tap(player: string) {
    return () => {
      if (justDragged.current) return;
      onTap(player);
    };
  }

  return { drag, over, startDrag, tap };
}

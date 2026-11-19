import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Icon } from "../components";

/** Near the top or the bottom edge of the box that scrolls, it scrolls on while a row is dragged. */
const scrollEdge = 56;
const scrollStep = 12;

export interface OrderItem {
  /** Unique key of the row. */
  readonly key: string;
  /** The shown name. */
  readonly label: string;
}

interface OrderListProps {
  readonly items: readonly OrderItem[];
  /** The accessible name of the handle of a row. */
  readonly moveLabel: (place: number, label: string) => string;
  /** The row with this key was moved to the place with this index (counted from 0). */
  readonly onMove: (key: string, toIndex: number) => void;
}

/** The nearest ancestor that scrolls, or nothing when the page itself does. */
function scrollParent(element: HTMLElement | null): HTMLElement | undefined {
  for (let node = element?.parentElement; node; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowY;
    if ((overflow === "auto" || overflow === "scroll") && node.scrollHeight > node.clientHeight) {
      return node;
    }
  }
  return undefined;
}

/**
 * A list with fixed places 1, 2, 3 ... in which a row is dragged by its handle to another place (mouse
 * or finger); with the keyboard the arrow keys on the handle move it. This is the one look of every
 * reorder list of the games (the playing order of the teams, the seats). The list reorders live while a
 * row is dragged; the owner of the order handles `onMove`.
 */
export function OrderList({ items, moveLabel, onMove }: OrderListProps) {
  const list = useRef<HTMLOListElement>(null);
  const [dragged, setDragged] = useState<string>();
  const latestMove = useRef(onMove);
  useEffect(() => {
    latestMove.current = onMove;
  });

  /** The place under the pointer, from the rows as they are on the screen right now. */
  function placeAt(y: number): number {
    const rows = [...(list.current?.children ?? [])];
    const at = rows.findIndex((row) => y < row.getBoundingClientRect().bottom);
    return at < 0 ? Math.max(0, rows.length - 1) : at;
  }

  function startDrag(key: string) {
    return (event: ReactPointerEvent) => {
      if (event.button !== 0) return;
      event.preventDefault();
      setDragged(key);
      let pointerY = event.clientY;
      let frame = 0;
      const place = () => latestMove.current(key, placeAt(pointerY));
      // Held near the edge of the box that scrolls, it scrolls on; the row is placed again after that.
      const scrollNearEdge = () => {
        const panel = scrollParent(list.current);
        if (panel) {
          const box = panel.getBoundingClientRect();
          if (pointerY < box.top + scrollEdge) {
            panel.scrollBy(0, -scrollStep);
            place();
          } else if (pointerY > box.bottom - scrollEdge) {
            panel.scrollBy(0, scrollStep);
            place();
          }
        }
        frame = requestAnimationFrame(scrollNearEdge);
      };
      const move = (moved: PointerEvent) => {
        pointerY = moved.clientY;
        place();
      };
      const end = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
        setDragged(undefined);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
      frame = requestAnimationFrame(scrollNearEdge);
    };
  }

  function keyMove(key: string, place: number) {
    return (event: KeyboardEvent) => {
      const step = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
      if (step === 0) return;
      event.preventDefault();
      onMove(key, place + step);
    };
  }

  return (
    <ol className="kit-order" ref={list}>
      {items.map((item, place) => (
        <li
          className="kit-order__row"
          data-dragging={dragged === item.key || undefined}
          key={item.key}
        >
          <span className="kit-order__place">{place + 1}.</span>
          <div className="kit-order__box">
            <span className="kit-order__name">{item.label}</span>
            <button
              aria-label={moveLabel(place + 1, item.label)}
              className="kit-order__handle"
              onKeyDown={keyMove(item.key, place)}
              onPointerDown={startDrag(item.key)}
              type="button"
            >
              <Icon name="grip" />
            </button>
          </div>
        </li>
      ))}
    </ol>
  );
}
